import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, cardPaddingClass } from '@/components/ui/Card'
import { Textarea } from '@/components/ui/Textarea'
import { Paragraph } from '@/components/ui/Typography'
import { useAddNoteToProfile } from '../hooks/useFacultyManagement'
import { useToast } from '@/hooks/useToast'

export function FacultyAdminNoteCard({ facultyId, adminNote }: { facultyId: string, adminNote: string }) {
  const [note, setNote] = useState(adminNote ?? '')

  console.log("ad note", adminNote)

  const { mutateAsync: addNoteToProfile } = useAddNoteToProfile(facultyId)
  const toast = useToast()

  const handleAddNote = async () => {
    const loadingToastId = toast.info('Saving note...', {
      title: 'Saving note',
      duration: 60_000,
    })

    try {
      await addNoteToProfile({ facultyId, note })
      // setNote('')

      toast.dismiss(loadingToastId)
      toast.success('Note added successfully.', { title: 'Note saved' })
    } catch (error) {
      toast.dismiss(loadingToastId)
      const message =
        error instanceof Error ? error.message : 'Failed to save note.'
      toast.error(message, { title: 'Save failed' })
    }
  }

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
          onClick={handleAddNote}
        >
          Save Note
        </Button>
      </CardBody>
    </Card>
  )
}
