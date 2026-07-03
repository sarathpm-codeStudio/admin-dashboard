import { useCallback, useRef, useState } from 'react'
import { Mp3Encoder } from '@breezystack/lamejs'

// Cross-platform strategy: iOS can't play WebM/Opus, so voice notes must be
// AAC (.m4a) or MP3.
//  • Safari's MediaRecorder encodes AAC natively → record audio/mp4 there.
//  • Chrome/Firefox can't encode AAC → capture raw PCM off the mic stream and
//    encode MP3 in the browser (lamejs). No server-side transcode needed.
// Either way the uploaded file plays on web, Android and iOS.
const AAC_MIME = 'audio/mp4'
// AAC-LC codec string — isTypeSupported() is true on Safari, false on
// Chrome/Firefox (Chrome's audio/mp4 would mux Opus, which iOS can't play).
const AAC_CODEC_MIME = 'audio/mp4;codecs=mp4a.40.2'

const canRecordAac = (): boolean =>
  typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(AAC_CODEC_MIME)

// Last-resort container ranking for browsers with no AAC and no Web Audio
// (recording still works there, just without iOS playback).
const pickFallbackMimeType = (): string => {
  if (typeof MediaRecorder === 'undefined') return ''
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
  ]
  for (const t of types) if (MediaRecorder.isTypeSupported(t)) return t
  return ''
}

// MP3 encoding settings for voice: mono at a speech-friendly bitrate.
const MP3_KBPS = 96
// lamejs works best fed whole MPEG frames (1152 samples); use a bigger
// multiple per call to keep the encode loop fast.
const MP3_BLOCK = 1152 * 16

// Encode captured mono Float32 PCM chunks → an MP3 blob.
const encodeMp3 = (chunks: Float32Array[], sampleRate: number): Blob => {
  let total = 0
  for (const c of chunks) total += c.length
  const pcm = new Int16Array(total)
  let o = 0
  for (const c of chunks) {
    for (let i = 0; i < c.length; i++) {
      const s = Math.max(-1, Math.min(1, c[i] ?? 0))
      pcm[o++] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
  }

  const encoder = new Mp3Encoder(1, sampleRate, MP3_KBPS)
  const parts: BlobPart[] = []
  for (let i = 0; i < pcm.length; i += MP3_BLOCK) {
    const out = encoder.encodeBuffer(pcm.subarray(i, i + MP3_BLOCK))
    if (out.length) parts.push(new Int8Array(out))
  }
  const end = encoder.flush()
  if (end.length) parts.push(new Int8Array(end))
  return new Blob(parts, { type: 'audio/mpeg' })
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
 * `waveform` that animates with your voice); `stop` resolves the recorded blob
 * (AAC .m4a on Safari, MP3 elsewhere — both iOS-playable), its measured
 * duration, and the captured waveform `peaks`; `cancel` discards. The mic
 * track and audio graph are always released when recording ends.
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

  // Raw PCM capture for the in-browser MP3 encode (non-Safari path).
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const pcmChunksRef = useRef<Float32Array[]>([])
  const sampleRateRef = useRef(44100)

  const cleanup = useCallback(() => {
    window.clearInterval(timerRef.current)
    window.clearInterval(sampleTimerRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    recorderRef.current = null
    // Tear the audio graph down and release the context.
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null
      processorRef.current.disconnect()
      processorRef.current = null
    }
    analyserRef.current = null
    const ctx = audioCtxRef.current
    audioCtxRef.current = null
    if (ctx && ctx.state !== 'closed') void ctx.close()
  }, [])

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const useAac = canRecordAac()
    if (useAac) {
      // Safari: native AAC-in-mp4 recording (.m4a), directly iOS-playable.
      // Pass the full codec string so the browser can't silently pick Opus
      // for a plain audio/mp4 container (Opus-in-mp4 won't play on iOS).
      mimeRef.current = AAC_MIME
      const recorder = new MediaRecorder(stream, { mimeType: AAC_CODEC_MIME })
      chunksRef.current = []
      recorder.ondataavailable = e => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      recorder.start()
      recorderRef.current = recorder
    }

    startedAtRef.current = Date.now()
    setElapsed(0)

    // Set up live level metering (both paths) and, when not recording AAC,
    // raw PCM capture for the in-browser MP3 encode.
    peaksRef.current = []
    pcmChunksRef.current = []
    setWaveform([])
    try {
      const AC: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      const ctx = new AC()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioCtxRef.current = ctx
      analyserRef.current = analyser

      if (!useAac) {
        mimeRef.current = 'audio/mpeg'
        sampleRateRef.current = ctx.sampleRate
        const processor = ctx.createScriptProcessor(4096, 1, 1)
        processor.onaudioprocess = e => {
          // The input buffer is reused between callbacks — copy it.
          pcmChunksRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)))
        }
        source.connect(processor)
        // A ScriptProcessor only runs while wired to the destination; its
        // output buffer stays zeroed, so nothing is audible.
        processor.connect(ctx.destination)
        processorRef.current = processor
      }

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
      // No Web Audio: no live waveform, and no PCM for the MP3 encode. If we
      // aren't already recording AAC, fall back to a container MediaRecorder
      // can produce so recording still works (won't play on iOS, but beats
      // failing outright on a browser this old).
      if (!useAac) {
        const mime = pickFallbackMimeType()
        mimeRef.current = mime || 'audio/webm'
        const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
        chunksRef.current = []
        recorder.ondataavailable = e => {
          if (e.data.size) chunksRef.current.push(e.data)
        }
        recorder.start()
        recorderRef.current = recorder
      }
    }

    setIsRecording(true)
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 250)
  }, [])

  const stop = useCallback((): Promise<RecordingResult | null> => {
    return new Promise(resolve => {
      const duration = (Date.now() - startedAtRef.current) / 1000
      const peaks = downsample(peaksRef.current, STORED_BARS)
      const recorder = recorderRef.current

      if (recorder) {
        // MediaRecorder path (Safari AAC, or the no-Web-Audio fallback).
        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeRef.current })
          cleanup()
          setIsRecording(false)
          setElapsed(0)
          setWaveform([])
          resolve({ blob, duration, mimeType: mimeRef.current, peaks })
        }
        recorder.stop()
        return
      }

      if (pcmChunksRef.current.length) {
        // MP3 path: grab the captured PCM before cleanup() closes the graph.
        const pcm = pcmChunksRef.current
        const rate = sampleRateRef.current
        pcmChunksRef.current = []
        cleanup()
        setIsRecording(false)
        setElapsed(0)
        setWaveform([])
        resolve({ blob: encodeMp3(pcm, rate), duration, mimeType: 'audio/mpeg', peaks })
        return
      }

      cleanup()
      setIsRecording(false)
      setElapsed(0)
      setWaveform([])
      resolve(null)
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
    pcmChunksRef.current = []
    setIsRecording(false)
    setElapsed(0)
    setWaveform([])
  }, [cleanup])

  return { isRecording, elapsed, waveform, start, stop, cancel }
}
