import type { PlayersResponse, SimilarResponse } from '../types'

const API_BASE = '/api'

export const searchPlayers = async (query: string, limit = 10): Promise<string[]> => {
  const response = await fetch(`${API_BASE}/players?q=${encodeURIComponent(query)}&limit=${limit}`)
  if (!response.ok) throw new Error('Failed to search players')
  const data: PlayersResponse = await response.json()
  return data.players
}

export const findSimilarPlayers = async (player: string, k = 10): Promise<SimilarResponse> => {
  const response = await fetch(`${API_BASE}/similar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player, k })
  })
  if (!response.ok) throw new Error('Failed to find similar players')
  return response.json()
}