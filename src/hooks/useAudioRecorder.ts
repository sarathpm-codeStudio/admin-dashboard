import { useCallback, useRef, useState } from 'react'

// Best available recording container/codec for this browser.
const pickMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') return ''
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
  ]
  for (const t of types) if (MediaRecorder.isTypeSupported(t)) return t
  return ''
}

// Squash an arbitrarily long list of live amplitude samples down to `count`
// bars (bucket-averaged) for the stored waveform.
const downsample = (values: number[], count: number): number[] => {
  if (values.length <= count) return values
  const block = values.length / count
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * block)
    const end = Math.floor((i + 1) * block)
    let sum = 0
    for (let j = start; j < end; j++) sum += values[j] ?? 0
    out.push(Math.round(sum / Math.max(1, end - start)))
  }
  return out
}

export interface RecordingResult {
  blob: Blob
  duration: number
  mimeType: string
  // Live-captured waveform (8..100 bar heights). Empty if the browser gave us
  // no analyser (the caller can fall back to a pseudo waveform).
  peaks: number[]
}

// How often we sample the mic level (ms) while recording.
const SAMPLE_INTERVAL = 100
// How many trailing bars the live waveform shows.
const LIVE_BARS = 48
// How many bars the stored waveform is squashed to.
const STORED_BARS = 40

/**
 * Microphone recorder for voice messages. `start` asks for mic permission and
 * begins recording (exposing a live `elapsed` seconds counter and a live
 * `waveform` that animates with your voice); `stop` resolves the recorded blob,
 * its measured duration, and the captured waveform `peaks`; `cancel` discards.
 * The mic track and audio graph are always released when recording ends.
 */
export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  // Live, scrolling waveform bars for the recording UI (most recent on the right).
  const [waveform, setWaveform] = useState<number[]>([])

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<number | undefined>(undefined)
  const startedAtRef = useRef(0)
  const mimeRef = useRef('')

  // Live level analysis so we can draw the waveform as the user speaks and hand
  // the finished waveform to the message without decoding the blob afterwards.
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sampleTimerRef = useRef<number | undefined>(undefined)
  const peaksRef = useRef<number[]>([])

  const cleanup = useCallback(() => {
    window.clearInterval(timerRef.current)
    window.clearInterval(sampleTimerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    recorderRef.current = null
    // Tear the analyser graph down and release the audio context.
    analyserRef.current = null
    const ctx = audioCtxRef.current
    audioCtxRef.current = null
    if (ctx && ctx.state !== 'closed') void ctx.close()
  }, [])

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const mime = pickMimeType()
    mimeRef.current = mime || 'audio/webm'
    const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    chunksRef.current = []
    recorder.ondataavailable = e => {
      if (e.data.size) chunksRef.current.push(e.data)
    }
    recorder.start()
    recorderRef.current = recorder
    startedAtRef.current = Date.now()
    setElapsed(0)

    // Set up live level metering off the same mic stream.
    peaksRef.current = []
    setWaveform([])
    try {
      const AC: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new AC()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      ctx.createMediaStreamSource(stream).connect(analyser)
      audioCtxRef.current = ctx
      analyserRef.current = analyser

      const buf = new Uint8Array(analyser.frequencyBinCount)
      sampleTimerRef.current = window.setInterval(() => {
        analyser.getByteTimeDomainData(buf)
        // RMS of the samples around the 128 midpoint → a 0..1 loudness.
        let sum = 0
        for (let i = 0; i < buf.length; i++) {
          const n = ((buf[i] ?? 128) - 128) / 128
          sum += n * n
        }
        const rms = Math.sqrt(sum / buf.length)
        // Scale to a lively 8..100 bar; the ×320 gain suits normal speech.
        const level = Math.max(8, Math.min(100, Math.round(rms * 320)))
        peaksRef.current.push(level)
        setWaveform(prev => [...prev, level].slice(-LIVE_BARS))
      }, SAMPLE_INTERVAL)
    } catch {
      // No Web Audio → skip the live waveform; sending still works.
    }

    setIsRecording(true)
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 250)
  }, [])

  const stop = useCallback((): Promise<RecordingResult | null> => {
    return new Promise(resolve => {
      const recorder = recorderRef.current
      if (!recorder) {
        resolve(null)
        return
      }
      const duration = (Date.now() - startedAtRef.current) / 1000
      const peaks = downsample(peaksRef.current, STORED_BARS)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeRef.current })
        cleanup()
        setIsRecording(false)
        setElapsed(0)
        setWaveform([])
        resolve({ blob, duration, mimeType: mimeRef.current, peaks })
      }
      recorder.stop()
    })
  }, [cleanup])

  const cancel = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = () => cleanup()
      recorder.stop()
    } else {
      cleanup()
    }
    setIsRecording(false)
    setElapsed(0)
    setWaveform([])
  }, [cleanup])

  return { isRecording, elapsed, waveform, start, stop, cancel }
}
