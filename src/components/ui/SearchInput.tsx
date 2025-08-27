import { useState, useEffect, useRef } from 'react'
import { searchPlayers } from '../../utils/api'

interface SearchInputProps {
  placeholder?: string
  onSubmit?: (query: string) => void
  onSelect?: (player: string) => void
  defaultValue?: string
  className?: string
}

export default function SearchInput({ 
  placeholder = "Search for a player...", 
  onSubmit, 
  onSelect,
  defaultValue = '',
  className = '' 
}: SearchInputProps) {
  const [query, setQuery] = useState(defaultValue)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length >= 2) {
        setLoading(true)
        try {
          const players = await searchPlayers(query, 8)
          setSuggestions(players)
          setShowSuggestions(true)
        } catch (error) {
          console.error('Failed to fetch suggestions:', error)
          setSuggestions([])
        } finally {
          setLoading(false)
        }
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim() && onSubmit) {
      onSubmit(query.trim())
      setShowSuggestions(false)
    }
  }

  const handleSelect = (player: string) => {
    setQuery(player)
    setShowSuggestions(false)
    if (onSelect) {
      onSelect(player)
    }
  }

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="input-primary"
          autoComplete="off"
        />
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 z-50 max-h-64 overflow-y-auto">
          {suggestions.map((player, index) => (
            <button
              key={index}
              onClick={() => handleSelect(player)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-2xl last:rounded-b-2xl transition-colors"
            >
              <span className="badge-primary mr-2">{player}</span>
            </button>
          ))}
        </div>
      )}
      
      {loading && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  )
}