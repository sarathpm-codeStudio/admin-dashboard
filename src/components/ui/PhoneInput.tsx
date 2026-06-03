import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'

export type CountryCodeOption = {
  value: string
  label: string
}

const defaultCountryCodes: CountryCodeOption[] = [
  { value: '+91', label: '+91' },
  { value: '+1', label: '+1' },
  { value: '+44', label: '+44' },
]

const fieldClass =
  'rounded-card border-0 bg-surface-input text-sm font-medium text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-50'

type PhoneInputProps = {
  countryCode: string
  phone: string
  onCountryCodeChange: (value: string) => void
  onPhoneChange: (value: string) => void
  countryOptions?: CountryCodeOption[]
  phoneId?: string
  phonePlaceholder?: string
  className?: string
}

export function PhoneInput({
  countryCode,
  phone,
  onCountryCodeChange,
  onPhoneChange,
  countryOptions = defaultCountryCodes,
  phoneId = 'phone',
  phonePlaceholder = 'Enter your registered number',
  className,
}: PhoneInputProps) {
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="relative w-[5.25rem] shrink-0">
        <select
          value={countryCode}
          onChange={(e) => onCountryCodeChange(e.target.value)}
          aria-label="Country code"
          className={cn(
            fieldClass,
            'w-full cursor-pointer appearance-none py-2.5 pl-3 pr-8',
          )}
        >
          {countryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-nav"
          aria-hidden
        />
      </div>
      <Input
        id={phoneId}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder={phonePlaceholder}
        value={phone}
        onChange={(e) => onPhoneChange(e.target.value)}
        className={cn(fieldClass, 'min-w-0 flex-1')}
      />
    </div>
  )
}
