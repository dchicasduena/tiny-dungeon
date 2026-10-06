import { useState } from 'react'
import { WALL_TILES } from './environmentAssets.js'
import Room from './Room.jsx'
import World from './World.jsx'
import { generateRoom } from './generateRoom.js'
import { buildWallRows } from './wallRows.js'

function makeLevel() {
  const grid = generateRoom()
  const walls = buildWallRows(grid)
  let door = null
  walls.forEach((row, r) =>
    row.forEach((tile, c) => {
      if (tile === WALL_TILES.wallDoor) door = { r, c }
    }),
  )
  return { grid, walls, door }
}

export default function GameScreen() {
  const [level, setLevel] = useState(makeLevel)
  const [doorOpen, setDoorOpen] = useState(false)

  const nextLevel = () => {
    setLevel(makeLevel())
    setDoorOpen(false)
  }

  return (
    <main className="game-screen" aria-label="tiny dungeon game">
      <div className="viewport">
        <Room grid={level.grid} walls={level.walls} doorOpen={doorOpen}>
          <World
            grid={level.grid}
            door={level.door}
            doorOpen={doorOpen}
            onCleared={() => setDoorOpen(true)}
            onExit={nextLevel}
          />
        </Room>
      </div>
    </main>
  )
}
