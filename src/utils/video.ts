const TPSTREAMS_ORG_ID = import.meta.env.VITE_TPSTREAMS_ORG_ID
const TPSTREAMS_ACCESS_TOKEN = import.meta.env.VITE_TPSTREAMS_ACCESS_TOKEN

/**
 * Builds a TPStreams embed URL for a video asset id.
 * Returns null when the asset id or required env credentials are missing.
 */
export function buildTpStreamsEmbedUrl(assetId: string | null | undefined): string | null {
  if (!assetId || !TPSTREAMS_ORG_ID || !TPSTREAMS_ACCESS_TOKEN) return null
  return `https://app.tpstreams.com/embed/${TPSTREAMS_ORG_ID}/${assetId}/?access_token=${TPSTREAMS_ACCESS_TOKEN}`
}
