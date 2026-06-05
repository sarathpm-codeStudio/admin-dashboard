export type UserRole = 'Student' | 'Faculty' | 'Admin'

export type UserStatus = 'active' | 'pending' | 'rejected' | 'suspended'

export type UserRecord = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  coursesCount: number
  joinedDate: string
  initials: string
  avatarClassName: string
  avatarUrl: string | null
}
