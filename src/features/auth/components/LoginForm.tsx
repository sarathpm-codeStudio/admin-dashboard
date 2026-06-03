import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Paragraph } from '@/components/ui/Typography'
import { cn } from '@/utils/cn'

const authFieldClass =
  'border-0 bg-surface-input shadow-none focus:bg-white focus:ring-2 focus:ring-primary-50'

type LoginFormValues = {
  email: string
  password: string
  remember: boolean
}

export function LoginForm() {
  const navigate = useNavigate()
  const [values, setValues] = useState<LoginFormValues>({
    email: '',
    password: '',
    remember: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (patch: Partial<LoginFormValues>) => {
    setValues((prev) => ({ ...prev, ...patch }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!values.email.trim() || !values.password) {
      setError('Please enter your email and password.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // TODO: wire auth API / Supabase signIn
      await new Promise((resolve) => setTimeout(resolve, 400))
      navigate('/', { replace: true })
    } catch {
      setError('Sign in failed. Please check your credentials and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
      <FormField label="Email address" htmlFor="login-email">
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="admin@learninough.com"
          value={values.email}
          onChange={(e) => update({ email: e.target.value })}
          className={authFieldClass}
        />
      </FormField>

      <FormField label="Password" htmlFor="login-password">
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={(e) => update({ password: e.target.value })}
          className={authFieldClass}
        />
      </FormField>

      <label className="inline-flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={values.remember}
          onChange={(e) => update({ remember: e.target.checked })}
          className="size-4 rounded border-[#e2e8f0] text-primary focus:ring-primary-50"
        />
        <span className="text-sm text-ink-label">Remember me</span>
      </label>

      {error ? (
        <Paragraph variant="caption" className="text-center text-[#BA1A1A]">
          {error}
        </Paragraph>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        className={cn(
          'w-full rounded-nav py-3 text-sm font-semibold',
          'shadow-[0_6px_20px_rgba(0,11,96,0.28)]',
        )}
      >
        {submitting ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  )
}
