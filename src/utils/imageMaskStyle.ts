import type { CSSProperties } from 'react'

/** Renders dark-background PNG icons as a solid fill (no black box). */
export function imageMaskStyle(
  imageUrl: string,
  mode: 'alpha' | 'luminance' = 'luminance',
): CSSProperties {
  return {
    WebkitMaskImage: `url(${imageUrl})`,
    maskImage: `url(${imageUrl})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    ...(mode === 'luminance' && {
      WebkitMaskMode: 'luminance',
      maskMode: 'luminance',
    }),
  }
}
