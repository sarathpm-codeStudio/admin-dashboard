import { Header1 } from '@/components/ui/Typography'

export function DashboardHeader() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <Header1>
        Welcome Back, Super Admin <span aria-hidden>⭐</span>
      </Header1>
      {/* <Button variant="primary" className="shrink-0">
        <Download className="size-4" aria-hidden />
        Export CSV
      </Button> */}
    </div>
  )
}
