import { perDir, single } from './spriteAnims.js'

const HERO = 'Hero knight'

// Side sprites face right; they are mirrored for left.
// Idle side has 79 frames: the first 6 are the loop, the rest is a showcase of other moves.
export const HERO_ANIMS = {
  idle: perDir(HERO, 'Idle', 'Hero knight_idle', 6, true),
  walk: perDir(HERO, 'Walk', 'Hero knight_walk', 6, true),
  attack: perDir(HERO, 'Attack', 'Hero knight_attack', 5, false),
  hit: perDir(HERO, 'Hit', 'Hero knight_hit', 3, false),
  death: single(HERO, 'Death', 'Hero knight_death', 23, false),
}
