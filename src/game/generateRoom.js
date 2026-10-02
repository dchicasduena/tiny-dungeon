export const GRID_SIZE = 32

export const VOID = 0
export const FLOOR = 1
export const WALL = 2

const randInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1))
const pick = (list) => list[Math.floor(Math.random() * list.length)]

// Rows 0 and 1 stay free so every floor cell can have a wall above it.
const MIN_ROW = 2
const MAX = GRID_SIZE - 1
const CORRIDOR_WIDTH = 3

function fill(grid, { x, y, w, h }) {
  for (let r = y; r < y + h; r++) {
    for (let c = x; c < x + w; c++) {
      if (r >= MIN_ROW && r < MAX && c >= 1 && c < MAX) grid[r][c] = FLOOR
    }
  }
}

// Rectangle, L-shape or plus-shape inside the given bounds.
function carveRoom(grid, room) {
  const { x, y, w, h } = room
  const roll = Math.random()
  if (roll < 0.5 || w < 7 || h < 7) {
    fill(grid, room)
  } else if (roll < 0.75) {
    const cutW = randInt(2, Math.floor(w / 2) - 1)
    const cutH = randInt(2, Math.floor(h / 2) - 1)
    const left = Math.random() < 0.5
    const top = Math.random() < 0.5
    fill(grid, { x: left ? x + cutW : x, y, w: w - cutW, h })
    fill(grid, { x, y: top ? y + cutH : y, w, h: h - cutH })
  } else {
    const armW = randInt(3, Math.floor(w / 2))
    const armH = randInt(3, Math.floor(h / 2))
    fill(grid, { x: x + Math.floor((w - armW) / 2), y, w: armW, h })
    fill(grid, { x, y: y + Math.floor((h - armH) / 2), w, h: armH })
  }
}

const center = (r) => ({ x: Math.floor(r.x + r.w / 2), y: Math.floor(r.y + r.h / 2) })

// L-shaped corridor: horizontal from a, then vertical to b.
function carveCorridor(grid, a, b) {
  const half = Math.floor(CORRIDOR_WIDTH / 2)
  const x0 = Math.min(a.x, b.x) - half
  const x1 = Math.max(a.x, b.x) + half + 1
  const y0 = Math.min(a.y, b.y) - half
  const y1 = Math.max(a.y, b.y) + half + 1
  fill(grid, { x: x0, y: a.y - half, w: x1 - x0, h: CORRIDOR_WIDTH })
  fill(grid, { x: b.x - half, y: y0, w: CORRIDOR_WIDTH, h: y1 - y0 })
}

const overlaps = (a, b, margin) =>
  a.x < b.x + b.w + margin &&
  a.x + a.w + margin > b.x &&
  a.y < b.y + b.h + margin &&
  a.y + a.h + margin > b.y

function placeNear(from, w, h) {
  const gap = randInt(3, 6)
  const dir = pick(['left', 'right', 'up', 'down'])
  const offsetX = randInt(-Math.floor(w / 2), Math.floor(from.w / 2))
  const offsetY = randInt(-Math.floor(h / 2), Math.floor(from.h / 2))
  if (dir === 'left') return { x: from.x - gap - w, y: from.y + offsetY, w, h }
  if (dir === 'right') return { x: from.x + from.w + gap, y: from.y + offsetY, w, h }
  if (dir === 'up') return { x: from.x + offsetX, y: from.y - gap - h, w, h }
  return { x: from.x + offsetX, y: from.y + from.h + gap, w, h }
}

const inBounds = (r) => r.x >= 1 && r.y >= MIN_ROW && r.x + r.w <= MAX && r.y + r.h <= MAX

// Rooms grow outward from a first room, each linked to its parent by a corridor.
function carveLayout(grid) {
  const first = { w: randInt(7, 11), h: randInt(6, 9) }
  first.x = randInt(8, GRID_SIZE - 8 - first.w)
  first.y = randInt(8, GRID_SIZE - 8 - first.h)
  const rooms = [first]
  carveRoom(grid, first)

  const target = randInt(6, 10)
  for (let attempt = 0; attempt < 300 && rooms.length < target; attempt++) {
    const parent = pick(rooms)
    const next = placeNear(parent, randInt(5, 11), randInt(5, 9))
    if (!inBounds(next) || rooms.some((r) => overlaps(r, next, 2))) continue
    carveRoom(grid, next)
    carveCorridor(grid, center(parent), center(next))
    rooms.push(next)
  }
}

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
  carveLayout(grid)
  raiseWalls(grid)
  return grid
}
