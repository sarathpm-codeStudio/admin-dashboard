/**
 * Plays a short two-tone "ding" using the Web Audio API so we don't have to
 * ship a binary sound asset. Browsers block audio until the user has
 * interacted with the page at least once — by the time a notification arrives
 * the admin has almost always clicked something, so this just works. If the
 * context can't start we fail silently.
 */
let audioContext: AudioContext | null = null

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as any).webkitAudioContext
  if (!Ctor) return null
  if (!audioContext) audioContext = new Ctor()
  return audioContext
}

export function playNotificationSound(): void {
  const ctx = getContext()
  if (!ctx) return

  // Resume in case the context was auto-suspended by the browser.
  if (ctx.state === 'suspended') void ctx.resume()

  const now = ctx.currentTime
  const tones = [
    { freq: 880, start: 0 },
    { freq: 1174.66, start: 0.12 },
  ]

  for (const { freq, start } of tones) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.value = freq

    const t0 = now + start
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(0.15, t0 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + 0.3)
  }
}
