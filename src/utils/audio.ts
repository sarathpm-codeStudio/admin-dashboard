// Helpers for voice messages: a deterministic fallback waveform, real waveform
// extraction from a recorded blob, and duration formatting.

// Deterministic 8..100 bar heights from a seed (e.g. a message id), so a voice
// message without a computed waveform still renders stable "audio waves".
export const pseudoPeaks = (seed: string, count = 40): number[] => {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const peaks: number[] = []
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    peaks.push(20 + (h % 80))
  }
  return peaks
}

// Decode a recorded audio blob into { duration, peaks } for a WhatsApp-style
// waveform (peaks are 8..100). Returns empty peaks on failure so the caller can
// fall back to pseudoPeaks.
export const computeWaveform = async (
  blob: Blob,
  count = 40,
): Promise<{ duration: number; peaks: number[] }> => {
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    const duration = audioBuffer.duration
    const data = audioBuffer.getChannelData(0)
    const block = Math.floor(data.length / count) || 1

    const raw: number[] = []
    let max = 0
    for (let i = 0; i < count; i++) {
      let sum = 0
      const start = i * block
      for (let j = 0; j < block; j++) {
        const v = data[start + j] ?? 0
        sum += v * v
      }
      const rms = Math.sqrt(sum / block)
      raw.push(rms)
      if (rms > max) max = rms
    }
    const peaks = raw.map(r => Math.max(8, Math.round((r / (max || 1)) * 100)))
    void ctx.close()
    return { duration, peaks }
  } catch {
    return { duration: 0, peaks: [] }
  }
}

// Whole-second mm:ss, e.g. 75 → "1:15".
export const formatDuration = (seconds: number): string => {
  const s = Math.max(0, Math.round(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

// Voice-message metadata carried (encrypted) in a message's `content`.
export interface AudioMeta {
  d: number // duration seconds
  w: number[] // waveform peaks (8..100)
}

// Parse the JSON meta stored in an AUDIO message's decrypted content.
export const parseAudioMeta = (content: string | null): AudioMeta => {
  if (!content) return { d: 0, w: [] }
  try {
    const parsed = JSON.parse(content)
    return {
      d: typeof parsed.d === 'number' ? parsed.d : 0,
      w: Array.isArray(parsed.w) ? parsed.w : [],
    }
  } catch {
    return { d: 0, w: [] }
  }
}
