import { PiExportBold } from 'react-icons/pi'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

type ExportDataButtonProps = {
  className?: string
  label?: string
  onClick?: () => void
}

export function ExportDataButton({
  className,
  label = 'Export Data',
  onClick,
}: ExportDataButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn(
        'shrink-0 border-[#E0E3E5] bg-[#FFFFFF] text-[#191C1E] hover:bg-[#F8FAFC] hover:text-[#191C1E]',
        className,
      )}
    >
      <PiExportBold className="size-5" aria-hidden />
      {label}
    </Button>
  )
}
