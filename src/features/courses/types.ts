export type CourseApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED'

export type CoursesAnalytics = {
  totalCourses: number
  growth: { percent: number; display: string }
  pendingApproval: number
  activeCourses: number
  engagementRate: number
  engagementDisplay: string
  rejectedCourses: number
  rejectedDisplay: string
}

export type CourseRecord = {
  id: string
  title: string
  facultyId: string
  facultyName: string
  category: string
  price: number
  priceDisplay: string
  status: CourseApprovalStatus
  isDraft: boolean
  studentsCount: number
  revenueDisplay: string
}

export type CourseFilterOptions = {
  categories: string[]
  faculty: { id: string; name: string }[]
}
