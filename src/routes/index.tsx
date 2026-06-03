import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoginPage } from '@/pages/LoginPage'
import { AccountPage } from '@/pages/AccountPage'
import { ChatsPage } from '@/pages/ChatsPage'
import { CourseManagementPage } from '@/pages/CourseManagementPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { FinancialManagementPage } from '@/pages/FinancialManagementPage'
import { HelpCenterPage } from '@/pages/HelpCenterPage'
import { ReportsAnalyticsPage } from '@/pages/ReportsAnalyticsPage'
import { FacultyCoursesPage } from '@/pages/FacultyCoursesPage'
import { FacultyEnrollmentPage } from '@/pages/FacultyEnrollmentPage'
import { FacultyDetailPage } from '@/pages/FacultyDetailPage'
import { StudentDetailPage } from '@/pages/StudentDetailPage'
import { UserManagementPage } from '@/pages/UserManagementPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="userdetails/faculty/:facultyId" element={<FacultyDetailPage />} />
        <Route
          path="userdetails/faculty/:facultyId/courses"
          element={<FacultyCoursesPage />}
        />
        <Route
          path="userdetails/faculty/:facultyId/enrollment"
          element={<FacultyEnrollmentPage />}
        />
        <Route path="userdetails/student/:studentId" element={<StudentDetailPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="courses" element={<CourseManagementPage />} />
        <Route path="financial" element={<FinancialManagementPage />} />
        <Route path="chats" element={<ChatsPage />} />
        <Route path="reports" element={<ReportsAnalyticsPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="help" element={<HelpCenterPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
