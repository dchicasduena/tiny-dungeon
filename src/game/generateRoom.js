export const GRID_SIZE = 16

export const VOID = 0
export const FLOOR = 1
export const WALL = 2

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1))
const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Row 0 and 1 stay free so every floor cell can have a wall above it.
const MIN_ROW = 2
const MAX = GRID_SIZE - 1

function fill(grid, { x, y, w, h }) {
  for (let r = y; r < y + h; r++) {
    for (let c = x; c < x + w; c++) {
      if (r >= MIN_ROW && r < MAX && c >= 1 && c < MAX) grid[r][c] = FLOOR
    }
  }
}

const centered = (size, span) => Math.floor((span - size) / 2)

// One big rectangle.
function hall(grid) {
  const w = randInt(8, 14)
  const h = randInt(6, 12)
  fill(grid, { x: randInt(1, MAX - w), y: randInt(MIN_ROW, MAX - h), w, h })
}

// Two overlapping rectangles: L, T or Z shapes depending on offsets.
function lShape(grid) {
  const w1 = randInt(8, 13)
  const h1 = randInt(4, 7)
  const x1 = randInt(1, MAX - w1)
  const y1 = randInt(MIN_ROW, MAX - h1 - 3)
  fill(grid, { x: x1, y: y1, w: w1, h: h1 })

  const w2 = randInt(4, 6)
  const h2 = randInt(4, MAX - y1 - h1 + 2)
  const x2 = pick([x1, x1 + w1 - w2, x1 + randInt(0, w1 - w2)])
  fill(grid, { x: x2, y: y1 + h1 - 2, w: w2, h: h2 })
}

// Plus-shaped room.
function cross(grid) {
  const armW = randInt(4, 6)
  const armH = randInt(4, 6)
  const longW = randInt(10, 14)
  const longH = randInt(10, 12)
  const cx = randInt(centered(longW, GRID_SIZE) - 1, centered(longW, GRID_SIZE) + 1)
  const cy = MIN_ROW + randInt(0, 1)
  fill(grid, { x: cx + centered(armW, longW), y: cy, w: armW, h: longH })
  fill(grid, { x: cx, y: cy + centered(armH, longH), w: longW, h: armH })
}

// Several overlapping rectangles forming an irregular cave.
function cave(grid) {
  let prev = null
  const count = randInt(4, 7)
  for (let i = 0; i < count; i++) {
    const w = randInt(4, 9)
    const h = randInt(4, 7)
    let x = randInt(1, MAX - w)
    let y = randInt(MIN_ROW, MAX - h)
    if (prev) {
      x = Math.max(1, Math.min(MAX - w, prev.x + randInt(-w + 3, prev.w - 3)))
      y = Math.max(MIN_ROW, Math.min(MAX - h, prev.y + randInt(-h + 3, prev.h - 3)))
    }
    fill(grid, { x, y, w, h })
    prev = { x, y, w, h }
  }
}

// Wide central room with a chamber attached on each side.
function chambers(grid) {
  const w = randInt(6, 8)
  const h = randInt(6, 9)
  const x = centered(w, GRID_SIZE)
  const y = randInt(MIN_ROW, MAX - h)
  fill(grid, { x, y, w, h })
  const side = randInt(4, 5)
  const sideH = randInt(4, Math.min(6, h))
  fill(grid, { x: x - side + 1, y: y + randInt(0, h - sideH), w: side, h: sideH })
  fill(grid, { x: x + w - 1, y: y + randInt(0, h - sideH), w: side, h: sideH })
}

const SHAPES = [hall, lShape, cross, cave, chambers]

// A void cell directly above a floor cell becomes a wall facing the player.
function raiseWalls(grid) {
  for (let r = 0; r < GRID_SIZE - 1; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === VOID && grid[r + 1][c] === FLOOR) grid[r][c] = WALL
    }
  }
}

export function generateRoom() {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(VOID))
  pick(SHAPES)(grid)
  raiseWalls(grid)
  return grid
}
