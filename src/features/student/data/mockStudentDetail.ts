import type { UserStatus } from '@/features/users/data/mockUsers'

import studentAvatar from '@/asset/image/elena.png'

export type StudentCourseStatus = 'completed' | 'active'

export type EnrolledCourse = {
  id: string
  name: string
  facultyName: string
  progressPercent: number
  progressLabel: string
  avgTestScore: number | '-'
  status: StudentCourseStatus
}

export type StudentDetail = {
  id: string
  name: string
  studentId: string
  course: string
  lastLogin: string
  joined: string
  phone: string
  email: string
  status: UserStatus
  avatarUrl?: string
  stats: {
    coursesEnrolled: number
    testScore: string
    totalCoins: number
    totalSpend: string
  }
  enrolledCourses: EnrolledCourse[]
}

export const mockStudentElena: StudentDetail = {
  id: 'elena-rodriguez',
  name: 'Elena Rodriguez',
  studentId: '2024-ER8921',
  course: 'CMA',
  lastLogin: 'Today 11:40 pm',
  joined: '02/12/2026',
  phone: '+91 5248554665',
  email: 'e.rodriguez@academy.edu',
  status: 'active',
  avatarUrl: studentAvatar,
  stats: {
    coursesEnrolled: 3,
    testScore: '94.8%',
    totalCoins: 1200,
    totalSpend: '₹12500',
  },
  enrolledCourses: [
    {
      id: 'c1',
      name: 'Advanced Microeconomics',
      facultyName: 'John mathew',
      progressPercent: 100,
      progressLabel: 'Complete',
      avgTestScore: 80,
      status: 'completed',
    },
    {
      id: 'c2',
      name: 'Data Science 101',
      facultyName: 'zara Kn',
      progressPercent: 90,
      progressLabel: '90% Complete',
      avgTestScore: 50,
      status: 'active',
    },
    {
      id: 'c3',
      name: 'Statistical Modelling',
      facultyName: 'rahman KC',
      progressPercent: 45,
      progressLabel: '45% Complete',
      avgTestScore: '-',
      status: 'active',
    },
  ],
}

/** Mock lookup — replace with API when backend is wired */
export function getStudentById(studentId: string): StudentDetail | undefined {
  if (studentId === mockStudentElena.id || studentId === '1' || studentId === '3') {
    return { ...mockStudentElena, id: studentId }
  }
  return { ...mockStudentElena, id: studentId, name: `Student ${studentId}` }
}
