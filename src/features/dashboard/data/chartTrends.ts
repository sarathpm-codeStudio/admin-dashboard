export type TrendPeriod = 'week' | 'month' | 'year'

export type EnrollmentTrendPoint = {
  label: string
  students: number
  faculty: number
}

export type RevenueTrendPoint = {
  label: string
  revenue: number
}

export const enrollmentTrendsByPeriod: Record<TrendPeriod, EnrollmentTrendPoint[]> = {
  week: [
    { label: 'Mon', students: 24200, faculty: 1180 },
    { label: 'Tue', students: 24450, faculty: 1185 },
    { label: 'Wed', students: 24600, faculty: 1190 },
    { label: 'Thu', students: 24750, faculty: 1192 },
    { label: 'Fri', students: 24900, faculty: 1195 },
    { label: 'Sat', students: 24950, faculty: 1198 },
    { label: 'Sun', students: 25000, faculty: 1200 },
  ],
  month: [
    { label: 'Jan', students: 950, faculty: 500 },
    { label: 'Feb', students: 1350, faculty: 720 },
    { label: 'Mar', students: 2000, faculty: 950 },
    { label: 'Apr', students: 1750, faculty: 800 },
    { label: 'May', students: 2240, faculty: 412 },
    { label: 'Jun', students: 2700, faculty: 1200 },
  ],
  year: [
    { label: '2020', students: 12000, faculty: 520 },
    { label: '2021', students: 15500, faculty: 680 },
    { label: '2022', students: 19000, faculty: 850 },
    { label: '2023', students: 22000, faculty: 1020 },
    { label: '2024', students: 25000, faculty: 1200 },
  ],
}

export const revenueTrendsByPeriod: Record<TrendPeriod, RevenueTrendPoint[]> = {
  week: [
    { label: 'Mon', revenue: 3.2 },
    { label: 'Tue', revenue: 3.8 },
    { label: 'Wed', revenue: 4.1 },
    { label: 'Thu', revenue: 3.9 },
    { label: 'Fri', revenue: 4.5 },
    { label: 'Sat', revenue: 5.2 },
    { label: 'Sun', revenue: 4.8 },
  ],
  month: [
    { label: 'Jan', revenue: 12 },
    { label: 'Feb', revenue: 14 },
    { label: 'Mar', revenue: 13 },
    { label: 'Apr', revenue: 16 },
    { label: 'May', revenue: 17 },
    { label: 'Jun', revenue: 18 },
  ],
  year: [
    { label: '2020', revenue: 8.5 },
    { label: '2021', revenue: 10.2 },
    { label: '2022', revenue: 12.8 },
    { label: '2023', revenue: 15.4 },
    { label: '2024', revenue: 18 },
  ],
}

export const periodSubtitles: Record<TrendPeriod, string> = {
  week: 'Weekly performance overview',
  month: 'Monthly performance overview',
  year: 'Yearly performance overview',
}

export const enrollmentSubtitles: Record<TrendPeriod, string> = {
  week: 'Institutional user growth breakdown (Last 7 Days)',
  month: 'Institutional user growth breakdown (Last 6 Months)',
  year: 'Institutional user growth breakdown (Last 5 Years)',
}

/** Full month labels for enrollment chart X-axis (month period) */
export const enrollmentMonthTickLabels: Record<string, string> = {
  Jan: 'JANUARY',
  Feb: 'FEBRUARY',
  Mar: 'MARCH',
  Apr: 'APRIL',
  May: 'MAY',
  Jun: 'JUNE',
}

export const enrollmentTooltipMonths: Record<string, string> = {
  Jan: 'JANUARY 2024',
  Feb: 'FEBRUARY 2024',
  Mar: 'MARCH 2024',
  Apr: 'APRIL 2024',
  May: 'MAY 2024',
  Jun: 'JUNE 2024',
}

export const revenueGrowthByPeriod: Record<TrendPeriod, number> = {
  week: 12.6,
  month: 18.4,
  year: 24.8,
}
