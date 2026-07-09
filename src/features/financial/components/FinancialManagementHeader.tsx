import { useState } from 'react'
import { Download, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { useProcessPayouts } from '@/features/financial/hooks/useFinancialManagement'
import { useToastStore } from '@/store/toastStore'

export function FinancialManagementHeader() {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const showToast = useToastStore((state) => state.show)
  const { mutate: processPayouts, isPending } = useProcessPayouts()

  const handleProcessPayouts = () => {
    processPayouts(undefined, {
      onSuccess: (result) => {
        setConfirmOpen(false)

        if (result.processedCount === 0 && result.failures.length === 0) {
          showToast({
            variant: 'info',
            title: 'Nothing to process',
            message: 'There are no pending payouts right now.',
          })
          return
        }

        if (result.processedCount > 0) {
          showToast({
            variant: 'success',
            title: 'Payouts processed',
            message: `Paid ₹${result.totalAmount.toLocaleString('en-IN')} to ${result.processedCount} facult${result.processedCount === 1 ? 'y' : 'ies'}.`,
          })
        }

        if (result.failures.length > 0) {
          showToast({
            variant: 'error',
            title: 'Some payouts failed',
            message: result.failures
              .map((f) => `${f.faculty}: ${f.error}`)
              .join(' • '),
          })
        }
      },
      onError: (error) => {
        setConfirmOpen(false)
        showToast({
          variant: 'error',
          title: 'Payout run failed',
          message: error.message,
        })
      },
    })
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <Header1>Financial Management</Header1>
        <Paragraph variant="muted" className="mt-1">
          Track revenue, manage commissions, and process payouts.
        </Paragraph>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="shrink-0">
          <Download className="size-4" aria-hidden />
          Export Reports
        </Button>
        <Button
          className="shrink-0"
          disabled={isPending}
          onClick={() => setConfirmOpen(true)}
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Wallet className="size-4" aria-hidden />
          )}
          {isPending ? 'Processing…' : 'Process Payouts'}
        </Button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => !isPending && setConfirmOpen(false)}
        onConfirm={handleProcessPayouts}
        isLoading={isPending}
        title="Process all pending payouts?"
        message="This settles every unpaid enrollment: each faculty with pending sales gets one payout for their share, the platform commission is recorded, and the faculty is notified. This cannot be undone."
        confirmLabel="Process Payouts"
      />
    </div>
  )
}
