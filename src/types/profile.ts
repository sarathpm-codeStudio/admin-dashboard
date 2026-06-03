export type AppRole = 'ADMIN' | 'FACULTY' | 'STUDENT' | string

export type ProfileAuthRow = {
  role: AppRole
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  account_id: string | null
  email: string | null
}
