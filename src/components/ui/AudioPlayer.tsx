import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { formatDuration, parseAudioMeta, pseudoPeaks, type AudioMeta } from '@/utils/audio'

interface AudioPlayerProps {
  src: string
  // Either pass parsed meta, or the raw (decrypted) message content to parse.
  meta?: AudioMeta
  content?: string | null
  // Stable seed (message id) for the fallback waveform.
  seed: string
  // Own message → light-on-dark colours; peer → dark-on-light.
  mine: boolean
  // Optimistic upload state for a voice message that's still being sent:
  // 'uploading' shows a spinner in place of play, 'error' shows a retry button.
  // Omitted (the default) means the audio is uploaded and fully playable.
  uploadState?: 'uploading' | 'error'
  // Invoked when the retry button is tapped in the 'error' state.
  onRetry?: () => void
}

// WhatsApp-style voice player: play/pause, a clickable waveform that fills as it
// plays, and a running time. Progress is driven by our measured duration since
// MediaRecorder blobs often report an Infinite `audio.duration`.
export function AudioPlayer({ src, meta, content, seed, mine, uploadState, onRetry }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)

  const resolved = meta ?? parseAudioMeta(content ?? null)
  const duration = resolved.d || 0
  const peaks = resolved.w.length ? resolved.w : pseudoPeaks(seed)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setCurrent(el.currentTime)
    const onEnd = () => {
      setPlaying(false)
      setCurrent(0)
    }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnd)
    el.addEventListener('pause', () => setPlaying(false))
    el.addEventListener('play', () => setPlaying(true))
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('ended', onEnd)
    }
  }, [])

  const toggle = () => {
    const el = audioRef.current
    if (!el) return
    if (el.paused) void el.play()
    else el.pause()
  }

  const progress = duration > 0 ? Math.min(current / duration, 1) : 0

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current
    // Not seekable until the clip has finished uploading.
    if (!el || duration <= 0 || uploadState) return
    const rect = e.currentTarget.getBoundingClientRect()
    const fraction = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
    try {
      el.currentTime = fraction * duration
      setCurrent(fraction * duration)
    } catch {
      /* seeking may be unsupported for some blobs — ignore */
    }
  }

  const btn = mine ? 'bg-white/20 text-white' : 'bg-primary text-white'
  const played = mine ? 'bg-white' : 'bg-primary'
  const track = mine ? 'bg-white/35' : 'bg-gray-300'
  const time = mine ? 'text-white/80' : 'text-gray-500'

  return (
    <div className="flex w-full max-w-full items-center gap-3 sm:min-w-[210px]">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      {uploadState === 'uploading' ? (
        <div
          aria-label="Uploading voice message"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${btn}`}
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        </div>
      ) : uploadState === 'error' ? (
        <button
          type="button"
          onClick={onRetry}
          aria-label="Retry sending voice message"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${btn}`}
        >
          <RotateCcw size={16} />
        </button>
      ) : (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${btn}`}
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="translate-x-[1px]" />}
        </button>
      )}

      <div className="min-w-0 flex-1">
        <div
          onClick={seek}
          className={`flex h-8 items-center gap-[2px] overflow-hidden ${uploadState ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
        >
          {peaks.map((h, i) => {
            const filled = i / peaks.length <= progress
            return (
              <span
                key={i}
                className={`w-[3px] min-w-[2px] rounded-full ${filled ? played : track}`}
                style={{ height: `${Math.max(10, h)}%` }}
              />
            )
          })}
        </div>
        <span className={`text-[10px] ${uploadState === 'error' ? 'font-semibold text-red-200' : time}`}>
          {uploadState === 'uploading'
            ? 'Uploading…'
            : uploadState === 'error'
              ? 'Failed — tap to retry'
              : formatDuration(playing || current > 0 ? current : duration)}
        </span>
      </div>
    </div>
  )
}

export default AudioPlayer
