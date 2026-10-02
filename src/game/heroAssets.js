// Hero knight animation frames; the rest of the game only imports from here.
const BASE = `${import.meta.env.BASE_URL}assets/sprites/Characters/Hero knight/`

const frames = (folder, action, dir, count) =>
  Array.from({ length: count }, (_, i) =>
    encodeURI(`${BASE}${folder}/Hero knight_${action}_${dir}_${i + 1}.png`),
  )

const anim = (folder, action, counts, loop) => ({
  frameTime: 0.1,
  loop,
  down: frames(folder, action, 'down', counts.down),
  side: frames(folder, action, 'side', counts.side),
  up: frames(folder, action, 'up', counts.up),
})

export const HERO_ANIMS = {
  // Idle side has 79 frames: the first 6 are the loop, the rest is a showcase of other moves.
  idle: anim('Idle', 'idle', { down: 6, side: 6, up: 6 }, true),
  walk: anim('Walk', 'walk', { down: 6, side: 6, up: 6 }, true),
  attack: anim('Attack', 'attack', { down: 5, side: 5, up: 5 }, false),
}

// Side sprites face right; they are mirrored for left.
// Each frame is 48x48; the feet sit at about (24, 30) inside it.
export const HERO_SPRITE = { size: 3, feetX: 24 / 48, feetY: 30 / 48 }
