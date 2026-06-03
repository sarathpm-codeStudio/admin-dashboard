import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

type ExportDataButtonProps = {
  className?: string
}

export function ExportDataButton({ className }: ExportDataButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'shrink-0 border-transparent bg-[#E6E8EA] text-[#312E81] hover:bg-[#dce0e3] hover:text-[#312E81]',
        className,
      )}
    >
      <Download className="size-4" aria-hidden />
      Export Data
    </Button>
  )
}
