import enrollIcon from '@/asset/image/enroll.png'
import coinsIcon from '@/asset/image/coins.png'
import spendIcon from '@/asset/image/spend.png'
import testIcon from '@/asset/image/test.png'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'
import type { StudentDetail } from '@/features/student/data/mockStudentDetail'

export function getStudentStatItems(student: StudentDetail): SummaryStatItem[] {
  const { stats } = student

  return [
    {
      id: 'courses-enrolled',
      label: 'Course enrolled',
      value: String(stats.coursesEnrolled).padStart(2, '0'),
      headerImage: enrollIcon,
      headerImageAlt: 'Courses enrolled',
    },
    {
      id: 'test-score',
      label: 'Test score',
      value: stats.testScore,
      headerImage: testIcon,
      headerImageAlt: 'Test score',
    },
    {
      id: 'total-coins',
      label: 'Total coins',
      value: stats.totalCoins.toLocaleString(),
      headerImage: coinsIcon,
      headerImageAlt: 'Total coins',
    },
    {
      id: 'total-spend',
      label: 'Total spend',
      value: stats.totalSpend,
      headerImage: spendIcon,
      headerImageAlt: 'Total spend',
    },
  ]
}
