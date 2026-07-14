import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, GraduationCap, Loader2, Search, UserRound, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useDebounce } from '@/hooks/useDebounce'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import { MIN_SEARCH_LENGTH, useGlobalSearch } from '@/features/search/hooks/useGlobalSearch'
import type { SearchResult } from '@/api/globalSearch/globalSearch.api'
import { cn } from '@/utils/cn'

const routeFor = (result: SearchResult) => {
  switch (result.type) {
    case 'course':
      return `/courses/${result.id}/course-details`
    case 'student':
      return `/userdetails/student/${result.id}`
    case 'faculty':
      return `/userdetails/faculty/${result.id}`
  }
}

type Props = {
  wrapperClassName?: string
}

export function GlobalSearch({ wrapperClassName }: Props) {
  const navigate = useNavigate()

  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  // Index into the flattened row list, for arrow-key navigation. -1 = nothing highlighted.
  const [activeIndex, setActiveIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedTerm = useDebounce(term, 300)
  const { recents, addRecent, removeRecent, clearRecents } = useRecentSearches()

  const { data, isFetching, isError } = useGlobalSearch(debouncedTerm)

  const isSearching = term.trim().length >= MIN_SEARCH_LENGTH
  // `term` leads `debouncedTerm` by up to 300ms — treat that gap as loading too,
  // otherwise the dropdown briefly shows stale results as if they were final.
  const isLoading = isSearching && (isFetching || term.trim() !== debouncedTerm.trim())

  const courses = data?.courses ?? []
  const students = data?.students ?? []
  const faculty = data?.faculty ?? []

  // One flat list of everything focusable, so arrow keys can walk courses →
  // students → faculty without caring which section a row is in. Empty while the
  // skeleton is up: those rows aren't on screen, so arrow keys must not select them.
  const rows = useMemo(
    () => (isSearching && !isLoading ? [...courses, ...students, ...faculty] : []),
    [isSearching, isLoading, courses, students, faculty],
  )
  const navigableCount = isSearching ? rows.length : recents.length

  // Any change to what's listed invalidates the highlight position.
  useEffect(() => setActiveIndex(-1), [debouncedTerm, isSearching])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function goToResult(result: SearchResult) {
    addRecent(term)
    setOpen(false)
    setTerm('')
    inputRef.current?.blur()
    navigate(routeFor(result))
  }

  function runRecent(recent: string) {
    setTerm(recent)
    addRecent(recent)
    inputRef.current?.focus()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
      return
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (navigableCount === 0) return
      event.preventDefault()
      setOpen(true)
      const step = event.key === 'ArrowDown' ? 1 : -1
      // -1 means "nothing highlighted", so ArrowDown lands on the first row
      // and ArrowUp wraps to the last.
      setActiveIndex((prev) => {
        const next = prev + step
        if (next < 0) return navigableCount - 1
        if (next >= navigableCount) return 0
        return next
      })
      return
    }

    if (event.key === 'Enter') {
      if (isSearching && activeIndex >= 0 && rows[activeIndex]) {
        goToResult(rows[activeIndex])
      } else if (!isSearching && activeIndex >= 0 && recents[activeIndex]) {
        runRecent(recents[activeIndex])
      } else if (term.trim()) {
        // No row highlighted — just remember the term the admin typed.
        addRecent(term)
      }
    }
  }

  const showDropdown = open && (isSearching || recents.length > 0)

  return (
    <div ref={containerRef} className={cn('relative', wrapperClassName)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
      <Input
        ref={inputRef}
        value={term}
        onChange={(event) => {
          setTerm(event.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search students, faculty or courses..."
        autoComplete="off"
        className="pl-10 pr-10"
      />

      {isLoading ? (
        <Loader2
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-muted"
          aria-hidden
        />
      ) : term ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setTerm('')
            inputRef.current?.focus()
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-muted transition-colors hover:bg-surface-input hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[26rem] overflow-y-auto rounded-card border border-[#e2e8f0] bg-white py-1 shadow-lg">
          {/* Empty box → recent searches */}
          {!isSearching && recents.length > 0 && (
            <>
              <SectionHeader
                title="Recent searches"
                action={
                  <button
                    type="button"
                    onClick={clearRecents}
                    className="text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
                  >
                    Clear all
                  </button>
                }
              />
              {recents.map((recent, index) => (
                <div
                  key={recent}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => runRecent(recent)}
                  className={cn(
                    'group flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors',
                    activeIndex === index ? 'bg-surface-input' : 'hover:bg-surface-input',
                  )}
                >
                  <Clock className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
                  <span className="flex-1 truncate text-sm text-ink">{recent}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${recent}`}
                    onClick={(event) => {
                      event.stopPropagation()
                      removeRecent(recent)
                    }}
                    className="rounded p-1 opacity-0 transition-all hover:bg-[#e2e8f0] group-hover:opacity-100"
                  >
                    <X className="h-3 w-3 text-ink-muted" />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Typing → live suggestions */}
          {isSearching && (
            <>
              {isError && (
                <p className="px-4 py-6 text-center text-sm text-[#ba1a1a]">
                  Couldn't load results. Please try again.
                </p>
              )}

              {/* The skeleton replaces the whole list on every load, not just the
                  first one — otherwise the previous term's results sit there
                  looking final while the new ones are still in flight. */}
              {!isError && isLoading && <ResultsSkeleton />}

              {!isError && !isLoading && rows.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-ink-muted">
                  No courses, students or faculty match “{term.trim()}”
                </p>
              )}

              {!isError && !isLoading && (
                <>
                  <ResultSection
                    title="Courses"
                    results={courses}
                    offset={0}
                    activeIndex={activeIndex}
                    onHover={setActiveIndex}
                    onSelect={goToResult}
                  />
                  <ResultSection
                    title="Students"
                    results={students}
                    offset={courses.length}
                    activeIndex={activeIndex}
                    onHover={setActiveIndex}
                    onSelect={goToResult}
                  />
                  <ResultSection
                    title="Faculty"
                    results={faculty}
                    offset={courses.length + students.length}
                    activeIndex={activeIndex}
                    onHover={setActiveIndex}
                    onSelect={goToResult}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 pb-1.5 pt-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">{title}</p>
      {action}
    </div>
  )
}

function ResultSection({
  title,
  results,
  offset,
  activeIndex,
  onHover,
  onSelect,
}: {
  title: string
  results: SearchResult[]
  // Where this section starts in the flattened row list the arrow keys walk.
  offset: number
  activeIndex: number
  onHover: (index: number) => void
  onSelect: (result: SearchResult) => void
}) {
  if (results.length === 0) return null

  return (
    <>
      <SectionHeader title={title} />
      {results.map((result, i) => {
        const index = offset + i
        return (
          <div
            key={result.id}
            onMouseEnter={() => onHover(index)}
            // Keep the input focused so the click-outside handler doesn't close
            // the dropdown before the click lands.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(result)}
            className={cn(
              'flex cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors',
              activeIndex === index ? 'bg-surface-input' : 'hover:bg-surface-input',
            )}
          >
            <ResultAvatar result={result} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{result.title}</p>
              {result.subtitle && (
                <p className="truncate text-xs text-ink-muted">{result.subtitle}</p>
              )}
            </div>
          </div>
        )
      })}
    </>
  )
}

function ResultAvatar({ result }: { result: SearchResult }) {
  const isCourse = result.type === 'course'

  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center overflow-hidden bg-surface-input',
        isCourse ? 'rounded-nav' : 'rounded-full',
      )}
    >
      {result.image ? (
        <img src={result.image} alt="" className="size-full object-cover" />
      ) : isCourse ? (
        <BookOpen className="h-4 w-4 text-ink-muted" aria-hidden />
      ) : result.type === 'faculty' ? (
        <GraduationCap className="h-4 w-4 text-ink-muted" aria-hidden />
      ) : (
        <UserRound className="h-4 w-4 text-ink-muted" aria-hidden />
      )}
    </div>
  )
}

// Mirrors the real dropdown's shape — labelled sections, square thumbnails for
// courses and round avatars for people — so the layout doesn't jump when the
// results land.
function SkeletonRow({ round }: { round?: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <div className={cn('size-9 shrink-0 bg-surface-input', round ? 'rounded-full' : 'rounded-nav')} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3 w-1/3 rounded bg-surface-input" />
        <div className="h-2.5 w-1/2 rounded bg-[#f8f9fb]" />
      </div>
    </div>
  )
}

function SkeletonHeader() {
  return (
    <div className="px-4 pb-1.5 pt-3">
      <div className="h-2.5 w-16 rounded bg-surface-input" />
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading results">
      <SkeletonHeader />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonHeader />
      <SkeletonRow round />
      <SkeletonRow round />
    </div>
  )
}
