import { GRID_SIZE } from './generateRoom.js'
import { SPRITE } from './spriteAnims.js'

// The room is drawn this many times larger than the visible window; the camera follows the hero.
export const ZOOM = 1.5

// Drives one on-screen sprite element: picks the frame and positions it in the room.
export function createSprite(box) {
  const img = box.querySelector('img')
  let key = ''
  let start = 0
  let src = ''
  box.style.display = ''

  return {
    restart() {
      key = ''
    },
    hide() {
      box.style.display = 'none'
    },
    play(name, anim, dir, now) {
      const k = `${name}-${dir}`
      if (k !== key) {
        key = k
        start = now
      }
      const list = anim[dir]
      const step = Math.floor((now - start) / (anim.frameTime * 1000))
      const index = anim.loop ? step % list.length : Math.min(step, list.length - 1)
      if (list[index] !== src) {
        src = list[index]
        img.src = src
      }
      return { index, length: list.length, done: !anim.loop && step >= list.length }
    },
    place(x, y, flip) {
      box.style.left = `${((x - SPRITE.size * SPRITE.feetX) / GRID_SIZE) * 100}%`
      box.style.top = `${((y - SPRITE.size * SPRITE.feetY) / GRID_SIZE) * 100}%`
      box.style.zIndex = Math.floor(y * 10)
      img.style.transform = flip ? 'scaleX(-1)' : 'none'
    },
  }
}
