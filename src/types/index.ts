export interface Player {
  name: string
  position: string
  score: number
  marketValue?: string
}

export interface SimilarResponse {
  query: string
  k: number
  results: Player[]
}

export interface PlayersResponse {
  players: string[]
}

export interface PlayerStats {
  general: Record<string, number | string>
  offensive: Record<string, number | string>
  defensive: Record<string, number | string>
  passing: Record<string, number | string>
  goalkeeper?: Record<string, number | string>
}