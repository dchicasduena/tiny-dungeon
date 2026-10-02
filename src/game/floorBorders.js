import { BORDER_TILES } from './environmentAssets.js'

const TILES = Object.values(BORDER_TILES)
const SIDES = ['top', 'bottom', 'left', 'right']
const CORNERS = [
  ['bottom', 'left'],
  ['bottom', 'right'],
  ['top', 'left'],
  ['top', 'right'],
]

const sidesOf = (t) => t.connectsTo.filter((s) => SIDES.includes(s))

const candidates = (sides, kind) =>
  TILES.filter((t) => {
    const s = sidesOf(t)
    return t.connectsTo.includes(kind) && s.length === sides.length && sides.every((x) => s.includes(x))
  })

const pick = (list) => list[Math.floor(Math.random() * list.length)]

// sides: edges touching empty space. diagonals: [v, h] corners where only the diagonal neighbour is empty.
export function pickBorders(sides, diagonals = []) {
  const left = new Set(sides)
  const out = []
  for (const pair of CORNERS) {
    if (!pair.every((s) => left.has(s))) continue
    const options = candidates(pair, 'inner')
    if (!options.length) continue
    out.push(pick(options).src)
    pair.forEach((s) => left.delete(s))
  }
  for (const side of left) {
    const options = candidates([side], 'outer')
    if (options.length) out.push(pick(options).src)
  }
  for (const pair of diagonals) {
    const options = candidates(pair, 'diagonal')
    if (options.length) out.push(pick(options).src)
  }
  return out
}
