import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header1 } from '@/components/ui/Typography'

export function FacultyCoursesPageHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Header1>Courses Created</Header1>
      <Button
        type="button"
        variant="outline"
        className="shrink-0 border-transparent bg-[#E6E8EA] text-[#312E81] hover:bg-[#dce0e3] hover:text-[#312E81]"
      >
        <Download className="size-4" aria-hidden />
        Export Data
      </Button>
    </div>
  )
}
