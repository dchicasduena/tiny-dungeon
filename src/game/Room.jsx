import { useMemo } from 'react'
import { WALL_TILES } from './environmentAssets.js'
import { pickBorders } from './floorBorders.js'
import { FLOOR, GRID_SIZE, VOID, WALL } from './generateRoom.js'
import { buildWallRows } from './wallRows.js'

const at = (grid, r, c) => grid[r]?.[c] ?? VOID

const wallSrc = (tile, doorOpen) =>
  (doorOpen && tile === WALL_TILES.wallDoor ? WALL_TILES.wallDoorOpen : tile).src

function floorBorders(grid, r, c) {
  const sides = []
  if (at(grid, r - 1, c) === VOID) sides.push('top')
  if (at(grid, r + 1, c) === VOID) sides.push('bottom')
  if (at(grid, r, c - 1) === VOID) sides.push('left')
  if (at(grid, r, c + 1) === VOID) sides.push('right')
  const diagonals = []
  for (const [v, dr] of [['top', -1], ['bottom', 1]]) {
    for (const [h, dc] of [['left', -1], ['right', 1]]) {
      if (!sides.includes(v) && !sides.includes(h) && at(grid, r + dr, c + dc) === VOID) {
        diagonals.push([v, h])
      }
    }
  }
  return pickBorders(sides, diagonals)
}

export default function Room({ grid, doorOpen = false }) {
  const cells = useMemo(() => {
    const out = []
    const walls = buildWallRows(grid)
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const type = grid[r][c]
        if (type === VOID) {
          out.push({ key: `${r}-${c}`, type })
        } else if (type === WALL) {
          out.push({ key: `${r}-${c}`, type, layers: [wallSrc(walls[r][c], doorOpen)] })
        } else {
          out.push({ key: `${r}-${c}`, type, layers: floorBorders(grid, r, c) })
        }
      }
    }
    return out
  }, [grid, doorOpen])

  return (
    <div className="room" style={{ '--grid-size': GRID_SIZE }}>
      {cells.map(({ key, type, layers }) => (
        <div key={key} className={`room-cell ${type === FLOOR ? 'is-floor' : ''}`}>
          {layers?.map((url, i) => (
            <img key={i} src={url} alt="" draggable="false" />
          ))}
        </div>
      ))}
    </div>
  )
}
