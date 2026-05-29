type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <h1 className="text-3xl font-semibold text-ink-heading">{title}</h1>
    </div>
  )
}
