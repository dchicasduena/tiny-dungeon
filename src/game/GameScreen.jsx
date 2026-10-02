import { useState } from 'react'
import { Link } from 'react-router-dom'
import Room from './Room.jsx'
import World from './World.jsx'
import { generateRoom } from './generateRoom.js'

export default function GameScreen() {
  const [grid, setGrid] = useState(generateRoom)

  return (
    <main className="game-screen" aria-label="tiny dungeon game">
      <Link className="back-link" to="/">
        back to title
      </Link>
      <div className="viewport">
        <Room grid={grid}>
          <World grid={grid} />
        </Room>
      </div>
      <button type="button" className="regen-button" onClick={() => setGrid(generateRoom())}>
        new room
      </button>
    </main>
  )
}