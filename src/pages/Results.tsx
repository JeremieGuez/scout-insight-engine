import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Header from '@/components/layout/Header'
import Avatar from '@/components/ui/Avatar'
import PlayerCard from '@/components/PlayerCard'
import { similar } from '@/lib/api'
import type { Player } from '@/types'

export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('query') || ''
  
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set())
  const [queriedPlayer, setQueriedPlayer] = useState<Player | null>(null)

  useEffect(() => {
    if (query) {
      fetchSimilarPlayers(query)
    }
  }, [query])

  const fetchSimilarPlayers = async (playerName: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await similar(playerName, 10)
      setPlayers(response.results)
      
      // Set the queried player info
      if (response.results.length > 0) {
        setQueriedPlayer({
          name: response.query,
          position: response.results[0]?.position || '—',
          score: 1.0
        })
      }
    } catch (err) {
      setError('Failed to fetch similar players')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (newQuery: string) => {
    setSearchParams({ query: newQuery })
  }

  const handlePlayerSelect = (player: Player, selected: boolean) => {
    const newSelected = new Set(selectedPlayers)
    if (selected) {
      newSelected.add(player.name)
    } else {
      newSelected.delete(player.name)
    }
    setSelectedPlayers(newSelected)
  }

  const handleCompare = () => {
    // TODO: Implement comparison functionality
    console.log('Compare players:', Array.from(selectedPlayers))
  }

  const handlePlayerClick = (playerName: string) => {
    navigate(`/player/${encodeURIComponent(playerName)}`)
  }

  if (loading) {
    return (
      <div>
        <Header 
          showSearch 
          onSearch={handleSearch}
          defaultSearchValue={query}
          showCompareButton
          compareCount={selectedPlayers.size}
          onCompare={handleCompare}
        />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header 
        showSearch 
        onSearch={handleSearch}
        defaultSearchValue={query}
        showCompareButton
        compareCount={selectedPlayers.size}
        onCompare={handleCompare}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Query Summary */}
        {queriedPlayer && (
          <div className="card mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={queriedPlayer.name} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-premium-black">{queriedPlayer.name}</h1>
                <p className="text-gray-600">{queriedPlayer.position}</p>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors">
                Position: All
              </button>
              <button className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors">
                Value: Any
              </button>
              <button className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors">
                Age: Any
              </button>
              <button className="px-4 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors">
                League: Any
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="card bg-red-50 border-red-200 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Results Grid */}
        {players.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-premium-black">
                Similar Players ({players.length})
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {players.map((player, index) => (
                <div key={index} onClick={() => handlePlayerClick(player.name)} className="cursor-pointer">
                  <PlayerCard 
                    player={player}
                    onSelect={(selected) => handlePlayerSelect(player, selected)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4">
              <button className="px-6 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <span className="text-gray-600">Page 1 of 1</span>
              <button className="px-6 py-2 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </>
        )}

        {players.length === 0 && !loading && !error && (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No similar players found for "{query}"</p>
            <p className="text-gray-500 text-sm">Try searching for a different player name</p>
          </div>
        )}
      </div>
    </div>
  )
}