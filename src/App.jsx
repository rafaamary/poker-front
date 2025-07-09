import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PlayerModal } from './components/PlayerModal.jsx'
import { Home } from './components/Home.jsx'
import { CreateRoomModal } from './components/CreateRoomModal.jsx'
import './App.css'
import { RoomModal } from './components/RoomModal.jsx'
import { GameModal } from './components/GameModal.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<PlayerModal />} />
        <Route path="/inicio" element={<Home />} />
        <Route path="/criar-sala" element={<CreateRoomModal />} />
        <Route path="/sala" element={<RoomModal />} />
        <Route path="/game" element={<GameModal />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
