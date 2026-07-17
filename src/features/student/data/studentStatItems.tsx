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
      value: Number(analytics.totalCoins ?? 0).toLocaleString(),
      valueClassName: 'self-start',
      valueAdornment: (
        <span className="ml-auto flex flex-col items-end gap-0.5 self-start text-right leading-tight">
          <span className="text-[12px] font-semibold text-amber-600">Current balance</span>
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[14px] font-bold text-amber-700">
            {Number(analytics.coinBalance ?? 0).toLocaleString()}
          </span>
        </span>
      ),
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
