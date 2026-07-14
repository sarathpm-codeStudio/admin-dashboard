import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { globalSearchFunctions } from '@/api/globalSearch/globalSearch.api'

// Single characters match almost everything, so don't hit the DB until there's
// enough of a term to be meaningful.
export const MIN_SEARCH_LENGTH = 2

export function useGlobalSearch(term: string) {
  const trimmed = term.trim()
  const enabled = trimmed.length >= MIN_SEARCH_LENGTH

  return useQuery({
    queryKey: ['global-search', trimmed.toLowerCase()],
    queryFn: () => globalSearchFunctions.search(trimmed),
    enabled,
    staleTime: 30_000,
    // Avoids a hard flicker back to empty when revisiting a cached term.
    placeholderData: keepPreviousData,
  })
}
