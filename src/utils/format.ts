export const formatMarketValue = (raw?: string): string => {
  if (!raw || raw === '-' || raw === 'not found') {
    return 'N/A'
  }
  return raw
}

export const getPlayerInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const formatSimilarityScore = (score: number): string => {
  return `${Math.round(score * 100)}%`
}