import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Paragraph } from '@/components/ui/Typography'

export function FacultyAdminNoteCard() {
  const [note, setNote] = useState('')

  return (
    <Card className={cardPaddingClass}>
      <CardBody>
        <Paragraph
          variant="label"
          className="uppercase tracking-wide text-ink-heading"
        >
          Internal admin note
        </Paragraph>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a private note about this faculty..."
          rows={4}
          className="min-h-[120px]"
        />
        <Button
          type="button"
          variant="secondary"
          className="w-full bg-primary-50 text-primary hover:bg-primary-100"
          onClick={() => setNote('')}
        >
          Save Note
        </Button>
      </CardBody>
    </Card>
  )
}
