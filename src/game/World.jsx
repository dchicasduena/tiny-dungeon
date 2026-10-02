import { useEffect, useMemo, useRef } from 'react'
import { canStand, findSpawn, standableSpots } from './collision.js'
import { ENEMY_NAMES, ENEMY_TYPES } from './enemyAssets.js'
import { GRID_SIZE } from './generateRoom.js'
import { HERO_ANIMS } from './heroAssets.js'
import { createSprite } from './sprite.js'
import { SPRITE, preload } from './spriteAnims.js'

const HERO_HP = 1200
const ENEMY_HP = 400
const HERO_DAMAGE = 100
const ENEMY_DAMAGE = 50

const HERO_SPEED = 4.5 // tiles per second
const HERO_REACH = 1.5 // how far in front of the hero a swing lands
const HERO_STRIKE_FRAME = 2
const HERO_INVULN_MS = 800

const ADJACENT = 1.1 // enemies only attack from this close
const ENEMY_REACH = 1.6 // the hit still lands if the hero steps back this far
const AGGRO = 6
const ATTACK_COOLDOWN_MS = 1200
const SEPARATION = 0.75

const KEYS = { w: 'up', s: 'down', a: 'left', d: 'right' }
const VECTORS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }

const rand = (min, max) => min + Math.random() * (max - min)
const dirOf = (facing) => (facing === 'left' || facing === 'right' ? 'side' : facing)
const faceVec = (dx, dy) =>
  Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down'

function planRoom(grid) {
  const hero = findSpawn(grid)
  const spots = standableSpots(grid)
    .filter((s) => Math.hypot(s.x - hero.x, s.y - hero.y) >= 5)
    .sort(() => Math.random() - 0.5)

  const wanted = 4 + Math.floor(Math.random() * 5)
  const enemies = []
  for (const s of spots) {
    if (enemies.length >= wanted) break
    if (enemies.some((e) => Math.hypot(e.x - s.x, e.y - s.y) < 1.5)) continue
    enemies.push({ ...s, type: ENEMY_NAMES[Math.floor(Math.random() * ENEMY_NAMES.length)] })
  }
  return { hero, enemies }
}

export default function World({ grid }) {
  const plan = useMemo(() => planRoom(grid), [grid])
  const heroBox = useRef(null)
  const enemyBoxes = useRef([])

  useEffect(() => {
    preload([HERO_ANIMS, ...Object.values(ENEMY_TYPES)])
    const room = heroBox.current.parentElement

    const hero = {
      x: plan.hero.x,
      y: plan.hero.y,
      hp: HERO_HP,
      facing: 'down',
      state: 'free', // free | attack | hit | dead
      dealt: false,
      invulnUntil: 0,
      sprite: createSprite(heroBox.current),
    }
    const enemies = plan.enemies.map((p, i) => ({
      x: p.x,
      y: p.y,
      hp: ENEMY_HP,
      type: ENEMY_TYPES[p.type],
      facing: 'down',
      state: 'idle', // idle | walk | attack | hit | dying | gone
      dealt: false,
      target: null,
      nextThink: 0,
      cooldownUntil: 0,
      sprite: createSprite(enemyBoxes.current[i]),
    }))

    const held = []
    let last = performance.now()
    let raf

    const setState = (ent, state) => {
      ent.state = state
      ent.dealt = false
      ent.sprite.restart()
    }

    const heroAlive = () => hero.state !== 'dead'
    const isAlive = (e) => e.state !== 'dying' && e.state !== 'gone'

    // Blocks a move that would push into another body.
    const blocked = (self, nx, ny) => {
      const bodies = [hero, ...enemies].filter((b) => b !== self && b.state !== 'gone' && b.state !== 'dying' && b.state !== 'dead')
      return bodies.some((b) => {
        const after = Math.hypot(nx - b.x, ny - b.y)
        return after < SEPARATION && after < Math.hypot(self.x - b.x, self.y - b.y)
      })
    }

    const tryMove = (ent, dx, dy) => {
      let moved = false
      if (canStand(grid, ent.x + dx, ent.y) && !blocked(ent, ent.x + dx, ent.y)) {
        ent.x += dx
        moved = true
      }
      if (canStand(grid, ent.x, ent.y + dy) && !blocked(ent, ent.x, ent.y + dy)) {
        ent.y += dy
        moved = true
      }
      return moved
    }

    const damageHero = (amount, now) => {
      if (!heroAlive() || now < hero.invulnUntil) return
      hero.hp -= amount
      if (hero.hp <= 0) {
        hero.hp = 0
        setState(hero, 'dead')
      } else {
        hero.invulnUntil = now + HERO_INVULN_MS
        setState(hero, 'hit')
      }
    }

    const damageEnemy = (e, amount) => {
      e.hp -= amount
      e.target = null
      setState(e, e.hp <= 0 ? 'dying' : 'hit')
    }

    const heroStrike = () => {
      const [fx, fy] = VECTORS[hero.facing]
      for (const e of enemies) {
        if (!isAlive(e)) continue
        const dx = e.x - hero.x
        const dy = e.y - hero.y
        const along = dx * fx + dy * fy
        const across = Math.abs(dx * fy - dy * fx)
        if (along > 0 && along <= HERO_REACH && across <= 0.9) damageEnemy(e, HERO_DAMAGE)
      }
    }

    const updateHero = (now, dt) => {
      const A = HERO_ANIMS
      let name = 'idle'

      if (hero.state === 'dead') {
        name = 'death'
      } else if (hero.state === 'hit') {
        name = 'hit'
      } else if (hero.state === 'attack') {
        name = 'attack'
      } else if (held.length) {
        hero.facing = held[held.length - 1]
        let dx = 0
        let dy = 0
        for (const d of held) {
          dx += VECTORS[d][0]
          dy += VECTORS[d][1]
        }
        const len = Math.hypot(dx, dy)
        if (len && tryMove(hero, (dx / len) * HERO_SPEED * dt, (dy / len) * HERO_SPEED * dt)) {
          name = 'walk'
        }
      }

      const r = hero.sprite.play(name, A[name], dirOf(hero.facing), now)
      if (name === 'attack') {
        if (!hero.dealt && r.index >= HERO_STRIKE_FRAME) {
          hero.dealt = true
          heroStrike()
        }
        if (r.done) setState(hero, 'free')
      } else if (name === 'hit' && r.done) {
        setState(hero, 'free')
      }
      hero.sprite.place(hero.x, hero.y, hero.facing === 'left')
    }

    const updateEnemy = (e, now, dt) => {
      if (e.state === 'gone') return
      const A = e.type
      const dist = Math.hypot(hero.x - e.x, hero.y - e.y)
      let name = 'idle'

      if (e.state === 'dying') {
        name = 'death'
      } else if (e.state === 'hit') {
        name = 'hit'
      } else if (e.state === 'attack') {
        name = 'attack'
      } else if (heroAlive() && dist <= ADJACENT) {
        e.facing = faceVec(hero.x - e.x, hero.y - e.y)
        if (now >= e.cooldownUntil) {
          setState(e, 'attack')
          name = 'attack'
        }
      } else {
        const chasing = heroAlive() && dist < AGGRO
        if (chasing) {
          e.target = { x: hero.x, y: hero.y }
        } else if (!e.target && now >= e.nextThink) {
          const near = standableSpots(grid).filter((s) => Math.hypot(s.x - e.x, s.y - e.y) <= 5)
          e.target = near.length ? near[Math.floor(Math.random() * near.length)] : null
          e.nextThink = now + rand(1500, 3500)
        }

        if (e.target) {
          const dx = e.target.x - e.x
          const dy = e.target.y - e.y
          const d = Math.hypot(dx, dy)
          if (d < 0.1) {
            e.target = null
          } else {
            e.facing = faceVec(dx, dy)
            const step = Math.min(A.speed * dt, d)
            if (tryMove(e, (dx / d) * step, (dy / d) * step)) {
              name = 'walk'
            } else if (!chasing) {
              e.target = null
              e.nextThink = now + 500
            }
          }
        }
      }

      const r = e.sprite.play(name, A[name], dirOf(e.facing), now)
      if (name === 'attack') {
        if (!e.dealt && r.index >= Math.floor(r.length / 2)) {
          e.dealt = true
          if (heroAlive() && dist <= ENEMY_REACH) damageHero(ENEMY_DAMAGE, now)
        }
        if (r.done) {
          e.cooldownUntil = now + ATTACK_COOLDOWN_MS
          setState(e, 'idle')
        }
      } else if (name === 'hit' && r.done) {
        setState(e, 'idle')
      } else if (name === 'death' && r.done) {
        setState(e, 'gone')
        e.sprite.hide()
        return
      }
      e.sprite.place(e.x, e.y, e.facing === 'left')
    }

    const onKeyDown = (ev) => {
      const dir = KEYS[ev.key.toLowerCase()]
      if (dir && !held.includes(dir)) held.push(dir)
    }
    const onKeyUp = (ev) => {
      const dir = KEYS[ev.key.toLowerCase()]
      if (dir && held.includes(dir)) held.splice(held.indexOf(dir), 1)
    }
    const onBlur = () => (held.length = 0)
    const onPointerDown = (ev) => {
      if (ev.button !== 0 || ev.target.closest('a, button')) return
      if (hero.state === 'free') setState(hero, 'attack')
    }

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      updateHero(now, dt)
      enemies.forEach((e) => updateEnemy(e, now, dt))
      const view = room.parentElement
      const size = room.offsetWidth
      const shift = (pos, viewSpan) => {
        if (size <= viewSpan) return (viewSpan - size) / 2
        return Math.min(0, Math.max(viewSpan - size, viewSpan / 2 - (pos / GRID_SIZE) * size))
      }
      room.style.transform = `translate(${shift(hero.x, view.clientWidth)}px, ${shift(hero.y, view.clientHeight)}px)`
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
  }, [plan, grid])

  const width = `${(SPRITE.size / GRID_SIZE) * 100}%`

  return (
    <>
      {plan.enemies.map((e, i) => (
        <div
          key={`${i}-${e.type}`}
          ref={(el) => (enemyBoxes.current[i] = el)}
          className="sprite"
          style={{ width }}
        >
          <img alt="" draggable="false" />
        </div>
      ))}
      <div ref={heroBox} className="sprite" style={{ width }}>
        <img alt="" draggable="false" />
      </div>
    </>
  )
}
