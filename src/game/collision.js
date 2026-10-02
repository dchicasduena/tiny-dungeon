import { FLOOR, GRID_SIZE, VOID } from './generateRoom.js'

const HALF_W = 0.3
const DEPTH = 0.3
const EPS = 0.0001

// Border sprites are drawn inside the tile, so the walkable area stops short of the empty edge.
const BORDER_SIDE = 0.25
const BORDER_BOTTOM = 0.2

// Position is the feet point; the feet box must sit on floor, clear of the borders.
export function canStand(grid, x, y) {
  for (const px of [x - HALF_W, x + HALF_W - EPS]) {
    for (const py of [y - DEPTH, y - EPS]) {
      const cx = Math.floor(px)
      const cy = Math.floor(py)
      if (grid[cy]?.[cx] !== FLOOR) return false
      const fx = px - cx
      const fy = py - cy
      if (grid[cy][cx - 1] === VOID && fx < BORDER_SIDE) return false
      if (grid[cy][cx + 1] === VOID && fx > 1 - BORDER_SIDE) return false
      if (grid[cy + 1]?.[cx] === VOID && fy > 1 - BORDER_BOTTOM) return false
    }
  }
  return true
}

// Cell centres where something can stand.
export function standableSpots(grid) {
  const spots = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (canStand(grid, c + 0.5, r + 0.5)) spots.push({ x: c + 0.5, y: r + 0.5 })
    }
  }
  return spots
}

// Standable spot closest to the bottom centre of the room.
export function findSpawn(grid) {
  let best = null
  for (const s of standableSpots(grid)) {
    const d = Math.hypot(s.x - GRID_SIZE / 2, s.y - (GRID_SIZE - 3.5))
    if (!best || d < best.d) best = { ...s, d }
  }
  return best
}
