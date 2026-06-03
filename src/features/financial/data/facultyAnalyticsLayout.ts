/** Earnings Growth card chrome — keep in sync with FacultyEarningsGrowthChart */
export const EARNINGS_CARD_PADDING_Y = 48
export const EARNINGS_HEADER_BLOCK = 76
export const EARNINGS_CHART_HEIGHT = 280
export const EARNINGS_CHART_HEIGHT_SM = 300
export const EARNINGS_CARD_MAX_WIDTH = 400

export const REVENUE_CARD_SCALE = 0.75

export function getEarningsCardHeight(smViewport = false) {
  const chartH = smViewport ? EARNINGS_CHART_HEIGHT_SM : EARNINGS_CHART_HEIGHT
  return EARNINGS_CARD_PADDING_Y + EARNINGS_HEADER_BLOCK + chartH
}

export function getRevenueCardHeight(smViewport = false) {
  return Math.round(getEarningsCardHeight(smViewport) * REVENUE_CARD_SCALE)
}

export function getRevenueCardMaxWidth() {
  return Math.round(EARNINGS_CARD_MAX_WIDTH * REVENUE_CARD_SCALE)
}
