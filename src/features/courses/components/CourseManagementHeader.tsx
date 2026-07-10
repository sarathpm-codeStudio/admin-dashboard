import { Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ExportDataButton } from '@/components/ui/ExportDataButton'
import { Header1, Paragraph } from '@/components/ui/Typography'

export function CourseManagementHeader() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Header1>Course Management</Header1>
        <Paragraph variant="muted" className="mt-1 max-w-2xl">
          Control, review, and optimize all courses on the platform
        </Paragraph>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" className="shrink-0" onClick={() => navigate('/courses/featured')}>
          <Star className="size-4" aria-hidden />
          Featured Courses
        </Button>
        <ExportDataButton />
      </div>
    </div>
  )
}
