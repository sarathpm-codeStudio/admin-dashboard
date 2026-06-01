/** Parse display dates like "Oct 12, 2023" for range filtering */
export function parseJoinedDate(value: string): Date | null {
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null
  return new Date(parsed)
}

export function formatJoinedDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

export function isJoinedDateInRange(
  joinedDate: string,
  from: string,
  to: string,
): boolean {
  const joined = parseJoinedDate(joinedDate)
  if (!joined) return false

  if (from) {
    const start = new Date(`${from}T00:00:00`)
    if (joined < start) return false
  }

  if (to) {
    const end = new Date(`${to}T23:59:59.999`)
    if (joined > end) return false
  }

  return true
}

export function formatIsoDateLabel(iso: string): string {
  const date = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(date.getTime())) return iso
  return formatJoinedDate(date)
}
