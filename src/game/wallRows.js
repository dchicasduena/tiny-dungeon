import { WALL_TILES as T } from './environmentAssets.js'
import { GRID_SIZE, WALL } from './generateRoom.js'

const STANDALONE_DECOR = [
  T.wallBanner,
  T.wallDrain,
  T.wallPaintingShort,
  T.wallSign,
  T.wallWindow,
  T.wallTube,
]

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Bars section: left end, one or more bars, right end (needs 3+ cells).
function barsSection(length) {
  const middle = Array.from({ length: length - 2 }, () => pick([T.wallBars, T.wallBarsBroken]))
  return [T.wallBarsLeft, ...middle, T.wallBarsRight]
}

// Run of n connected wall cells: left end, filler, right end.
function buildRun(n) {
  if (n === 1) return [T.wall]
  const tiles = Array(n).fill(T.wall)
  tiles[0] = T.wallLeft
  tiles[n - 1] = T.wallRight

  let i = 1
  while (i < n - 1) {
    const space = n - 1 - i
    if (space >= 3 && Math.random() < 0.2) {
      const len = 3 + Math.floor(Math.random() * Math.min(3, space - 2))
      barsSection(len).forEach((t, k) => (tiles[i + k] = t))
      i += len
    } else {
      if (Math.random() < 0.15) tiles[i] = pick(STANDALONE_DECOR)
      i++
    }
  }
  return tiles
}

// Returns a GRID_SIZE x GRID_SIZE array with a wall tile at each WALL cell.
export function buildWallRows(grid) {
  const rows = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null))
  for (let r = 0; r < GRID_SIZE; r++) {
    let c = 0
    while (c < GRID_SIZE) {
      if (grid[r][c] !== WALL) {
        c++
        continue
      }
      let end = c
      while (end < GRID_SIZE && grid[r][end] === WALL) end++
      buildRun(end - c).forEach((t, k) => (rows[r][c + k] = t))
      c = end
    }
  }
  placeDoor(rows)
  return rows
}

// The exit door replaces one plain wall tile that sits between two other wall tiles.
function placeDoor(rows) {
  const spots = []
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 1; c < GRID_SIZE - 1; c++) {
      if (rows[r][c] === T.wall && rows[r][c - 1] && rows[r][c + 1]) spots.push([r, c])
    }
  }
  if (spots.length) {
    const [r, c] = pick(spots)
    rows[r][c] = T.wallDoor
  }
}
