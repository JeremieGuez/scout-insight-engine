import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Results from './pages/Results'
import PlayerDetail from './pages/PlayerDetail'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/results" element={<Results />} />
        <Route path="/player/:name" element={<PlayerDetail />} />
      </Routes>
    </div>
  )
}

export default App