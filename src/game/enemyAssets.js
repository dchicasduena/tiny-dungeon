import { perDir, single, withLoop } from './spriteAnims.js'

const BAT = 'Enemy - Bat'
const GHOST = 'Enemy - Ghost'
const SKELETON = 'Enemy - Skeleton'
const SLUG = 'Enemy - Slug'

// Side sprites face right; they are mirrored for left.
// `speed` is in tiles per second.
const ghostWalk = perDir(GHOST, 'Walk', 'Ghost_walk', 6, true)

export const ENEMY_TYPES = {
  bat: {
    speed: 2.6,
    idle: perDir(BAT, 'Idle & Walk', 'Bat_idle_walk', 6, true),
    walk: perDir(BAT, 'Idle & Walk', 'Bat_idle_walk', 6, true),
    attack: perDir(BAT, 'Attack', 'Bat_attack', 8, false),
    hit: perDir(BAT, 'Hit', 'Bat_hit', 3, false),
    death: single(BAT, 'Death', 'Bat_death', 19, false),
  },
  ghost: {
    speed: 1.6,
    idle: perDir(GHOST, 'Idle', 'Ghost_idle', 6, true),
    walk: ghostWalk,
    // The ghost has no attack sprites, so its walk cycle plays once as a lunge.
    attack: withLoop(ghostWalk, false),
    hit: single(GHOST, 'Hit', 'Ghost_hit', 4, false),
    death: single(GHOST, 'Death', 'Ghost_death', 14, false),
  },
  skeleton: {
    speed: 1.8,
    idle: perDir(SKELETON, 'Idle', 'Skeleton_idle', 6, true),
    walk: perDir(SKELETON, 'Walk', 'Skeleton_walk', 8, true),
    attack: perDir(SKELETON, 'Attack', 'Skeleton_attack', 9, false),
    hit: perDir(SKELETON, 'Hit', 'Skeleton_hit', 3, false),
    death: single(SKELETON, 'Death', 'Skeleton_death', 12, false),
  },
  slug: {
    speed: 1.2,
    idle: perDir(SLUG, 'Idle', 'Slug_idle', 7, true),
    walk: perDir(SLUG, 'Walk', 'Slug_walk', 6, true),
    attack: perDir(SLUG, 'Attack', 'Slug_attack', 6, false),
    hit: perDir(SLUG, 'Hit', 'Slug_hit', 3, false),
    death: single(SLUG, 'Death', 'Slug_death', 16, false),
  },
}

export const ENEMY_NAMES = Object.keys(ENEMY_TYPES)
