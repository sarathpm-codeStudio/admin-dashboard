import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Button } from '@/components/ui/Button'
import { Header1, Paragraph } from '@/components/ui/Typography'

type CreateAnnouncementHeaderProps = {
  mode?: 'create' | 'edit'
  onSaveDraft: () => void
  isSaving?: boolean
  disabled?: boolean
}

export function CreateAnnouncementHeader({
  mode = 'create',
  onSaveDraft,
  isSaving = false,
  disabled = false,
}: CreateAnnouncementHeaderProps) {
  const isEdit = mode === 'edit'
  const pageTitle = isEdit ? 'Edit Campaign' : 'Create Campaign'

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'Announcements', to: '/announcements' },
          { label: pageTitle },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Header1>{pageTitle}</Header1>
          <Paragraph variant="muted" className="mt-1 max-w-2xl">
            {isEdit
              ? 'Update announcement details before republishing.'
              : 'Design and distribute high-impact academic updates.'}
          </Paragraph>
        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0"
          onClick={onSaveDraft}
          disabled={disabled || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
      </div>
    </div>
  )
}
