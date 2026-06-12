import { brand } from '@/config/navigation'

export function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-page">
      <img
        src={brand.brandIcon}
        alt={brand.name}
        className="size-28 animate-pulse"
      />
    </div>
  )
}
