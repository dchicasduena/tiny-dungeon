import { useState } from 'react'
import { Link } from 'react-router-dom'
import Room from './Room.jsx'
import Hero from './Hero.jsx'
import { generateRoom } from './generateRoom.js'

export default function GameScreen() {
  const [grid, setGrid] = useState(generateRoom)

  return (
    <main className="game-screen" aria-label="tiny dungeon game">
      <Link className="back-link" to="/">
        back to title
      </Link>
      <Room grid={grid}>
        <Hero grid={grid} />
      </Room>
      <button type="button" className="regen-button" onClick={() => setGrid(generateRoom())}>
        new room
      </button>
    </main>
  )
}