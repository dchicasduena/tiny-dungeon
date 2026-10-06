import { useEffect, useRef, useState } from 'react'
import { HashRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
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
        <Link className="credits-link" to="/credits">
          credits
        </Link>
      </div>
    </main>
  )
}

function CreditsScreen() {
  return (
    <main className="title-screen">
      <Link className="back-link" to="/">
        back to title
      </Link>
      <div className="title-content">
        <h1>credits</h1>
        <p className="credits-text">created by <Link className="credits-text-link" to="https://github.com/davidchicas" target="_blank" rel="noopener noreferrer">david chicas</Link></p>
        <p className="credits-text">dummy dungeon assets by <Link className="credits-text-link" to="https://sorto-dedd.itch.io/dummy-dungeon" target="_blank" rel="noopener noreferrer">sorto dedd</Link></p>
        <p className="credits-text">dummy dungeon character assets by <Link className="credits-text-link" to="https://sorto-dedd.itch.io/dummy-dungeon-character-pack" target="_blank" rel="noopener noreferrer">sorto dedd</Link></p>
        <p className="credits-text">pixelta font by <Link className="credits-text-link" to="https://www.dafont.com/pixelta.font?fpp=2008" target="_blank" rel="noopener noreferrer">blankids</Link></p>
        <p className="credits-text">dungeon font by <Link className="credits-text-link" to="https://github.com/davidchicas" target="_blank" rel="noopener noreferrer">vrtxrry</Link></p>
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
        <Route path="/credits" element={<CreditsScreen />} />
        <Route path="*" element={<TitleScreen />} />
      </Routes>
    </HashRouter>
  )
}