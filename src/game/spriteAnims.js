// Shared helpers for character animations (hero and enemies).
const ROOT = `${import.meta.env.BASE_URL}assets/sprites/Characters/`

// Every frame is 48 wide; the feet sit at about (24, 30) inside it.
export const SPRITE = { size: 3, feetX: 24 / 48, feetY: 30 / 48 }

const frames = (character, folder, name, count) =>
  Array.from({ length: count }, (_, i) =>
    encodeURI(`${ROOT}${character}/${folder}/${name}_${i + 1}.png`),
  )

const makeAnim = (loop, down, side, up) => ({ frameTime: 0.1, loop, down, side, up })

// Separate frames for down / side / up: files named `${name}_down_1.png` etc.
export const perDir = (character, folder, name, count, loop) =>
  makeAnim(
    loop,
    frames(character, folder, `${name}_down`, count),
    frames(character, folder, `${name}_side`, count),
    frames(character, folder, `${name}_up`, count),
  )

// Same frames for every direction: files named `${name}_1.png`.
export const single = (character, folder, name, count, loop) => {
  const list = frames(character, folder, name, count)
  return makeAnim(loop, list, list, list)
}

export const withLoop = (anim, loop) => ({ ...anim, loop })

export function preload(animSets) {
  animSets.forEach((set) =>
    Object.values(set).forEach((a) =>
      [a.down, a.side, a.up].flat().forEach((url) => {
        new Image().src = url
      }),
    ),
  )
}
