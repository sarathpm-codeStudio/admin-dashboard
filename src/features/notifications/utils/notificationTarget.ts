import type { AdminNotification } from '@/types/notification'

const str = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null

/**
 * Maps a notification to the in-app route it should open when clicked.
 * Resolution is type-driven first, then falls back to whatever id the `data`
 * payload carries — so newly added admin notification types still navigate
 * somewhere sensible. Returns `null` when there is no meaningful destination.
 *
 * Admin notifications today are `COURSE` with `{ courseId }`, which open the
 * course listing with that course's review modal (`?review=<courseId>`).
 */
const courseReviewHref = (courseId: string | null): string =>
  courseId ? `/courses?review=${courseId}` : '/courses'

export function resolveNotificationHref(n: AdminNotification): string | null {
  const data = (n.data ?? {}) as Record<string, unknown>
  const courseId = str(data.courseId) ?? str(data.course_id)
  const facultyId = str(data.facultyId) ?? str(data.faculty_id)
  const studentId = str(data.studentId) ?? str(data.student_id)

  switch (n.type) {
    case 'COURSE':
    case 'COURSE_UPDATE':
      return courseReviewHref(courseId)
    case 'FRIEND_JOINED':
    case 'FRIEND_ENROLLED':
      if (facultyId) return `/userdetails/faculty/${facultyId}`
      if (studentId) return `/userdetails/student/${studentId}`
      return '/users'
    case 'EXAM_REMINDER':
    case 'BADGE_UNLOCKED':
    case 'STREAK_REMINDER':
    case 'COINS_EARNED':
      // No dedicated admin destination — fall through to id-based resolution.
      break
  }

  if (courseId) return courseReviewHref(courseId)
  if (facultyId) return `/userdetails/faculty/${facultyId}`
  if (studentId) return `/userdetails/student/${studentId}`
  return null
}
