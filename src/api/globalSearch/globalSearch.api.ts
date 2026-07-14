import { supabase } from '@/config/supabase'

// How many of each type the suggestion dropdown shows.
const RESULT_LIMIT = 5

// Multi-token terms ("john sm") are matched with a deliberately broad OR in the
// database, then narrowed client-side. Over-fetch so that narrowing still has
// enough rows left to fill RESULT_LIMIT.
const PROFILE_FETCH_LIMIT = 30

export type SearchResultType = 'course' | 'student' | 'faculty'

export type SearchResult = {
  type: SearchResultType
  id: string
  title: string
  subtitle: string
  image?: string | null
}

export type SearchResults = {
  courses: SearchResult[]
  students: SearchResult[]
  faculty: SearchResult[]
}

const EMPTY: SearchResults = { courses: [], students: [], faculty: [] }

// The profile `or(...)` filter is built by string interpolation, so commas,
// parens and quotes in the term would break out of the filter expression and
// make PostgREST reject the whole query. Strip them. LIKE wildcards (% and _)
// are left alone: they can only widen the match, never escape the expression.
const sanitize = (term: string) => term.replace(/[,()"']/g, ' ').trim()

const fullNameOf = (row: { first_name?: string | null; last_name?: string | null }) =>
  `${row.first_name ?? ''} ${row.last_name ?? ''}`.trim()

/**
 * Global search across courses, students and faculty.
 *
 * Admin sees everything, so unlike the faculty dashboard there is no ownership
 * filter here — the only scoping is `role`, and ADMIN profiles are never
 * surfaced (an admin searching for people means students and faculty).
 */
export const globalSearchFunctions = {
  search: async (rawTerm: string): Promise<SearchResults> => {
    const term = sanitize(rawTerm)
    if (!term) return EMPTY

    const [courses, students, faculty] = await Promise.all([
      searchCourses(term),
      searchProfiles(term, 'STUDENT'),
      searchProfiles(term, 'FACULTY'),
    ])

    return { courses, students, faculty }
  },
}

async function searchCourses(term: string): Promise<SearchResult[]> {
  const { data, error } = await supabase
    .from('courses')
    .select(
      `id, title, cover_image, category,
       faculty:profiles!courses_faculty_id_fkey ( first_name, last_name )`,
    )
    // Mirrors the course-management list: no deleted courses, no unfinished drafts.
    .eq('is_deleted', false)
    .eq('is_draft', false)
    .ilike('title', `%${term}%`)
    .order('created_at', { ascending: false })
    .limit(RESULT_LIMIT)

  if (error) throw new Error(error.message)

  return (data ?? []).map((course: any) => {
    const facultyName = course.faculty ? fullNameOf(course.faculty) : ''
    return {
      type: 'course' as const,
      id: course.id,
      title: course.title ?? 'Untitled course',
      subtitle: [course.category, facultyName && `by ${facultyName}`]
        .filter(Boolean)
        .join(' · '),
      image: course.cover_image,
    }
  })
}

async function searchProfiles(
  term: string,
  role: 'STUDENT' | 'FACULTY',
): Promise<SearchResult[]> {
  const tokens = term.toLowerCase().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  // Postgres can't match "john smith" against first_name or last_name on its
  // own, so cast a wide OR net (any token against any field) and require ALL
  // tokens to be present once the rows are back.
  const orFilter = tokens
    .flatMap((t) => [
      `first_name.ilike.%${t}%`,
      `last_name.ilike.%${t}%`,
      `email.ilike.%${t}%`,
    ])
    .join(',')

  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, avatar_url, role')
    .eq('role', role)
    .or(orFilter)
    .limit(PROFILE_FETCH_LIMIT)

  if (error) throw new Error(error.message)

  const results: SearchResult[] = []

  for (const row of data ?? []) {
    const name = fullNameOf(row)
    const haystack = `${name} ${row.email ?? ''}`.toLowerCase()
    if (!tokens.every((t) => haystack.includes(t))) continue

    results.push({
      type: role === 'STUDENT' ? 'student' : 'faculty',
      id: row.id,
      title: name || (role === 'STUDENT' ? 'Unnamed student' : 'Unnamed faculty'),
      subtitle: row.email ?? '',
      image: row.avatar_url,
    })

    if (results.length === RESULT_LIMIT) break
  }

  return results
}
