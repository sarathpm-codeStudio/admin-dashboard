export type AnnouncementStatus = 'scheduled' | 'active' | 'expired' | 'draft'

export type AnnouncementRecord = {
  id: string
  name: string
  audience: string
  course: string
  date: string
  dateSort: string
  timePeriod: string
  status: AnnouncementStatus
  isDraft: boolean
}

export type AnnouncementTab = 'all' | 'drafts'

export type AnnouncementSort = 'date-desc' | 'date-asc'
