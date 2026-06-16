import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type CarouselProps = {
  /** Slides to render. Each entry is one fully-rendered slide. */
  slides: ReactNode[]
  /** Auto-advance interval in ms. Set to 0 to disable autoplay. */
  autoPlayInterval?: number
  /** Pause autoplay while the pointer is over the carousel. */
  pauseOnHover?: boolean
  /** Show the clickable dot indicators. */
  showDots?: boolean
  /** Loop back to the first slide after the last one. */
  loop?: boolean
  className?: string
  /** Extra classes for the viewport (the clipped track container). */
  viewportClassName?: string
}

export function Carousel({
  slides,
  autoPlayInterval = 4000,
  pauseOnHover = true,
  showDots = true,
  loop = true,
  className,
  viewportClassName,
}: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const count = slides.length

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) return
      setActiveIndex(((index % count) + count) % count)
    },
    [count],
  )

  const next = useCallback(() => {
    setActiveIndex((current) => {
      if (current >= count - 1) return loop ? 0 : current
      return current + 1
    })
  }, [count, loop])

  // Keep the active index valid if the number of slides changes.
  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(count - 1, 0)))
  }, [count])

  // Autoplay timer.
  useEffect(() => {
    if (autoPlayInterval <= 0 || count <= 1) return
    if (pauseOnHover && isPaused) return

    const id = window.setInterval(next, autoPlayInterval)
    return () => window.clearInterval(id)
  }, [autoPlayInterval, count, isPaused, next, pauseOnHover])

  if (count === 0) return null

  return (
    <div
      className={cn('flex w-full flex-col', className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      role="group"
      aria-roledescription="carousel"
    >
      <div className={cn('relative w-full overflow-hidden', viewportClassName)}>
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={index}
              className="w-full shrink-0 grow-0 basis-full"
              aria-hidden={index !== activeIndex}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showDots && count > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((_, index) => {
            const isActive = index === activeIndex
            return (
              <button
                key={index}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isActive}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 ease-out',
                  isActive
                    ? 'w-6 bg-[#2563EB]'
                    : 'w-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]',
                )}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
