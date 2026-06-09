import enrollIcon from '@/asset/image/enroll.png'
import coinsIcon from '@/asset/image/coins.png'
import spendIcon from '@/asset/image/spend.png'
import testIcon from '@/asset/image/test.png'
import type { SummaryStatItem } from '@/components/ui/SummaryStatsGrid'

export function getStudentStatItems(analytics: any): SummaryStatItem[] {
  if (!analytics) {
    return []
  }

  return [
    {
      id: 'courses-enrolled',
      label: 'Course enrolled',
      value: String(analytics.courseEnrolled ?? 0).padStart(2, '0'),
      headerImage: enrollIcon,
      headerImageAlt: 'Courses enrolled',
    },
    {
      id: 'test-score',
      label: 'Test score',
      value: analytics.testScore,
      headerImage: testIcon,
      headerImageAlt: 'Test score',
    },
    {
      id: 'total-coins',
      label: 'Total coins',
      value: analytics.totalCoins.toLocaleString(),
      headerImage: coinsIcon,
      headerImageAlt: 'Total coins',
    },
    {
      id: 'total-spend',
      label: 'Total spend',
      value: analytics.totalSpend.display,
      headerImage: spendIcon,
      headerImageAlt: 'Total spend',
    },
  ]
}
