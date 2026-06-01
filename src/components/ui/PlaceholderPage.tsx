import { Header1 } from '@/components/ui/Typography'

type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <Header1 size="display">{title}</Header1>
    </div>
  )
}
