import { useEffect, useRef, useState } from 'react'
import { HashRouter, Route, Routes, useNavigate } from 'react-router-dom'
import GameScreen from './game/GameScreen.jsx'

const DOORS = `${import.meta.env.BASE_URL}assets/sprites/Environment/Doors/`
const DOOR_CLOSED = encodeURI(`${DOORS}Door closed.png`)
const DOOR_OPEN = encodeURI(`${DOORS}Door open stairs.png`)
const ENTER_DELAY_MS = 2000

function TitleScreen() {
  const navigate = useNavigate()
  const [opened, setOpened] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const openDoor = () => {
    if (opened) return
    setOpened(true)
    timer.current = setTimeout(() => navigate('/game'), ENTER_DELAY_MS)
  }

  return (
    <main className="title-screen">
      <div className="title-content">
        <h1>tiny dungeon</h1>
        <h2>can you reach the bottom?</h2>
        <button
          type="button"
          className="door-button"
          onClick={openDoor}
          aria-label="Open the door"
        >
          <img src={opened ? DOOR_OPEN : DOOR_CLOSED} alt="" draggable="false" />
        </button>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TitleScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="*" element={<TitleScreen />} />
      </Routes>
    </HashRouter>
  )
}