import { Header1, Paragraph } from '@/components/ui/Typography'

export function UserManagementHeader() {
  return (
    <div>
      <Header1>User Management</Header1>
      <Paragraph variant="muted" className="mt-1 max-w-2xl">
        Manage students, faculty, and admins within the institutional ecosystem.
      </Paragraph>
    </div>
  )
}
