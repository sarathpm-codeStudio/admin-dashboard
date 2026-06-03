import { AuthLayout } from '@/components/layout/AuthLayout'
import { BrandMark } from '@/components/ui/BrandMark'
import { Card } from '@/components/ui/Card'
import { Header1, Paragraph } from '@/components/ui/Typography'
import { LoginForm } from '@/features/auth/components/LoginForm'

export function LoginView() {
  return (
    <AuthLayout>
      <Card className="w-full max-w-[24rem] border-[#e2e8f0]/50 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col items-center px-8 pb-8 pt-8">
          <BrandMark />
          <Header1 className="mt-5 text-center text-[30px] font-medium leading-tight text-[#191C1E]">
            Admin Sign in
          </Header1>
          <Paragraph variant="muted" className="mt-2 text-center">
            Access your dashboard and classrooms
          </Paragraph>

          <div className="mt-8 w-full">
            <LoginForm />
          </div>
        </div>
      </Card>
    </AuthLayout>
  )
}
