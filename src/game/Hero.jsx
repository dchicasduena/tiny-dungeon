import { useEffect, useRef } from 'react'
import { HERO_ANIMS, HERO_SPRITE } from './heroAssets.js'
import { FLOOR, GRID_SIZE, VOID } from './generateRoom.js'

const SPEED = 4.5 // tiles per second
const HALF_W = 0.3
const DEPTH = 0.3
const EPS = 0.0001

const KEYS = { w: 'up', s: 'down', a: 'left', d: 'right' }
const VECTORS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }

function findSpawn(grid) {
  let best = null
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== FLOOR || !canStand(grid, c + 0.5, r + 0.5)) continue
      const d = Math.hypot(c - GRID_SIZE / 2, r - (GRID_SIZE - 4))
      if (!best || d < best.d) best = { d, x: c + 0.5, y: r + 0.5 }
    }
  }
  return best
}

// Border sprites are drawn inside the tile, so the walkable area stops short of the empty edge.
const BORDER_SIDE = 0.25
const BORDER_BOTTOM = 0.2

function canStand(grid, x, y) {
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

export default function Hero({ grid }) {
  const boxRef = useRef(null)
  const imgRef = useRef(null)

  useEffect(() => {
    const box = boxRef.current
    const img = imgRef.current
    const spawn = findSpawn(grid)
    if (!spawn) return

    Object.values(HERO_ANIMS).forEach((a) =>
      [a.down, a.side, a.up].flat().forEach((url) => {
        new Image().src = url
      }),
    )

    const pos = { x: spawn.x, y: spawn.y }
    const held = []
    let facing = 'down'
    let attackStart = null
    let animKey = ''
    let animStart = 0
    let last = performance.now()
    let raf

    const onKeyDown = (e) => {
      const dir = KEYS[e.key.toLowerCase()]
      if (dir && !held.includes(dir)) held.push(dir)
    }
    const onKeyUp = (e) => {
      const dir = KEYS[e.key.toLowerCase()]
      if (dir && held.includes(dir)) held.splice(held.indexOf(dir), 1)
    }
    const onBlur = () => (held.length = 0)
    const onPointerDown = (e) => {
      if (e.button !== 0 || e.target.closest('a, button')) return
      if (attackStart === null) attackStart = performance.now()
    }

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const attacking = attackStart !== null
      let moving = false
      if (!attacking && held.length) {
        facing = held[held.length - 1]
        let dx = 0
        let dy = 0
        for (const d of held) {
          dx += VECTORS[d][0]
          dy += VECTORS[d][1]
        }
        const len = Math.hypot(dx, dy)
        if (len) {
          dx = (dx / len) * SPEED * dt
          dy = (dy / len) * SPEED * dt
          if (canStand(grid, pos.x + dx, pos.y)) pos.x += dx
          if (canStand(grid, pos.x, pos.y + dy)) pos.y += dy
          moving = true
        }
      }

      const action = attacking ? 'attack' : moving ? 'walk' : 'idle'
      const dir = facing === 'left' || facing === 'right' ? 'side' : facing
      const anim = HERO_ANIMS[action]
      const key = `${action}-${dir}`
      if (key !== animKey) {
        animKey = key
        animStart = now
      }

      const list = anim[dir]
      const step = Math.floor((now - animStart) / (anim.frameTime * 1000))
      if (attacking && step >= list.length) {
        attackStart = null
      }
      const index = anim.loop ? step % list.length : Math.min(step, list.length - 1)
      const url = list[index]
      if (img.getAttribute('src') !== url) img.src = url

      const { size, feetX, feetY } = HERO_SPRITE
      box.style.left = `${((pos.x - size * feetX) / GRID_SIZE) * 100}%`
      box.style.top = `${((pos.y - size * feetY) / GRID_SIZE) * 100}%`
      img.style.transform = facing === 'left' ? 'scaleX(-1)' : 'none'

      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    window.addEventListener('pointerdown', onPointerDown)
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [grid])

  return (
    <div
      ref={boxRef}
      className="hero"
      style={{ width: `${(HERO_SPRITE.size / GRID_SIZE) * 100}%` }}
    >
      <img ref={imgRef} alt="" draggable="false" />
    </div>
  )
}
