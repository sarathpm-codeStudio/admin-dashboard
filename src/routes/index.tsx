import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { NotFoundRedirect } from '@/routes/NotFoundRedirect'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicRoute } from '@/routes/PublicRoute'
import { LoginPage } from '@/pages/LoginPage'
import { PlatformSettingsPage } from '@/pages/PlatformSettingsPage'
import { CreateAnnouncementPage } from '@/pages/CreateAnnouncementPage'
import { EditAnnouncementPage } from '@/pages/EditAnnouncementPage'
import { ChatsPage } from '@/pages/ChatsPage'
import { AnnouncementsPage } from '@/pages/AnnouncementsPage'
import { CourseAcademicStructurePage } from '@/pages/CourseAcademicStructurePage'
import { CourseManagementPage } from '@/pages/CourseManagementPage'
import { FeaturedCoursesPage } from '@/pages/FeaturedCoursesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { FinancialManagementPage } from '@/pages/FinancialManagementPage'
import { GstReportPage } from '@/pages/GstReportPage'
import { HelpCenterPage } from '@/pages/HelpCenterPage'
import { ReportsAnalyticsPage } from '@/pages/ReportsAnalyticsPage'
import { FacultyCoursesPage } from '@/pages/FacultyCoursesPage'
import { FacultyEnrollmentPage } from '@/pages/FacultyEnrollmentPage'
import { FacultyRevenuePage } from '@/pages/FacultyRevenuePage'
import { FacultyDetailPage } from '@/pages/FacultyDetailPage'
import { FacultyReviewsPage } from '@/pages/FacultyReviewsPage'
import { StudentDetailPage } from '@/pages/StudentDetailPage'
import { UserManagementPage } from '@/pages/UserManagementPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardLayout />}>
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
          <Route
            path="userdetails/faculty/:facultyId/reviews"
            element={<FacultyReviewsPage />}
          />
          <Route
            path="userdetails/faculty/:facultyId/revenue"
            element={<FacultyRevenuePage />}
          />
          <Route path="userdetails/student/:studentId" element={<StudentDetailPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="courses" element={<CourseManagementPage />} />
          <Route path="courses/featured" element={<FeaturedCoursesPage />} />
          <Route
            path="courses/:courseId/course-details"
            element={<CourseAcademicStructurePage />}
          />
          <Route path="financial" element={<FinancialManagementPage />} />
          <Route path="gst-report" element={<GstReportPage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="announcements/create" element={<CreateAnnouncementPage />} />
          <Route path="announcements/:announcementId/edit" element={<EditAnnouncementPage />} />
          <Route path="reports" element={<ReportsAnalyticsPage />} />
          <Route path="platform-settings" element={<PlatformSettingsPage />} />
          <Route
            path="platform-settings/coin"
            element={<Navigate to="/platform-settings" replace />}
          />
          <Route
            path="platform-settings/commission"
            element={<Navigate to="/platform-settings" replace />}
          />
          <Route path="help" element={<HelpCenterPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  )
}
