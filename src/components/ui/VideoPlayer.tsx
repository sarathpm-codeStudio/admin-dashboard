import { Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'

export type VideoPlayerProps = {
  /** TPStreams (or other) iframe embed URL. */
  src: string
  /** Thumbnail shown before the user clicks play. */
  poster?: string | null
  className?: string
}

/**
 * Lightweight embed player: shows the poster with a play overlay, and only
 * loads the iframe (with autoplay) once the user clicks play.
 */
export function VideoPlayer({ src, poster, className }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    setPlaying(false)
  }, [src, poster])

  return (
    <div
      className={cn(
        'relative aspect-video w-full overflow-hidden rounded-xl bg-surface-input',
        className,
      )}
    >
      {playing ? (
        <iframe
          src={src.includes('?') ? `${src}&autoplay=1` : `${src}?autoplay=1`}
          className="absolute inset-0 size-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          title="Course video"
        />
      ) : (
        <button
          type="button"
          className="group absolute inset-0 size-full cursor-pointer border-0 p-0"
          onClick={() => setPlaying(true)}
          aria-label="Play video"
        >
          {poster ? (
            <img
              src={poster}
              alt="Video cover"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 size-full bg-primary-50" />
          )}
          <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/35" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:bg-white">
              <Play size={26} className="ml-1 fill-primary text-primary" aria-hidden />
            </div>
          </div>
        </button>
      )}
    </div>
  )
}
