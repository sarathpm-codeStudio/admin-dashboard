import type { FacultyTransaction } from '@/features/financial/data/mockFacultyRevenue'

export function filterFacultyTransactions(
  rows: FacultyTransaction[],
  search: string,
): FacultyTransaction[] {
  const query = search.trim().toLowerCase()
  if (!query) return rows

  return rows.filter((row) => {
    const haystack = [
      row.transactionId,
      row.courseName,
      row.studentName,
      row.date,
      row.type,
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(query)
  })
}
