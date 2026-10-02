// Central registry of environment sprites; the rest of the game only imports from here.
// Entry: (png name without extension, connectsTo, direction, size in tiles wide, type, edge)
// connectsTo: tiles it must touch on its open side; empty = can stand alone; ANY = any wall tile.
// edge: 'left' / 'right' = end of a run, nothing may touch that side.
const BASE = `${import.meta.env.BASE_URL}assets/sprites/Environment/`

const empty = []
export const ANY = '*'

const tile = (folder, name, connectsTo, direction, size, type, edge = null) => ({
  src: encodeURI(`${BASE}${folder}/${name}.png`),
  connectsTo,
  direction,
  size,
  type,
  edge,
})

const wall = (name, connectsTo, direction, size, type, edge) =>
  tile('Walls', name, connectsTo, direction, size, type, edge)

const border = (name, description, direction, size, type) =>
  tile('Borders', name, description, direction, size, type)

const door = (name, connectsTo, direction, size, type) =>
  tile('Doors', name, connectsTo, direction, size, type)

export const WALL_TILES = {
  wallBarsBroken: wall('Bars broken', empty, 's', 1, 'wall'),
  wallBarsLeft: wall('Bars left', ['wallBarsBroken', 'wallBars'], 's', 1, 'wall', 'left'),
  wallBarsRight: wall('Bars right', ['wallBarsBroken', 'wallBars'], 's', 1, 'wall', 'right'),
  wallBars: wall('Bars', empty, 's', 1, 'wall'),
  wallBanner: wall('Wall banner', empty, 's', 1, 'wall'),
  wallDoubleSided: wall('Wall double sided', empty, 's', 1, 'wall'),
  wallDrain: wall('Wall drain', empty, 's', 1, 'wall'),
  wallLeft: wall('Wall left', ANY, 's', 1, 'wall', 'left'),
  wallPaintingLong: wall('Wall painting long', empty, 's', 2, 'wall'),
  wallPaintingShort: wall('Wall painting short', empty, 's', 1, 'wall'),
  wallPillar: wall('Wall pillar', empty, 's', 1, 'wall'),
  wallRight: wall('Wall right', ANY, 's', 1, 'wall', 'right'),
  wallSign: wall('Wall sign', empty, 's', 1, 'wall'),
  wallTubeLeaking: wall('Wall tube leaking', empty, 's', 1, 'wall'),
  wallTube: wall('Wall tube', empty, 's', 1, 'wall'),
  wallWindow: wall('Wall window', empty, 's', 1, 'wall'),
  wall: wall('Wall', empty, 's', 1, 'wall'),
  wallDoor: door('Door closed', empty, 's', 1, 'wall'),
  wallDoorOpen: door('Door open', empty, 's', 1, 'wall'),
}

// connectsTo for borders: the tile sides carrying the line, plus 'outer' (one side), 'inner' (corner)
// or 'diagonal' (small nub in a corner where the diagonal neighbour is empty).
export const BORDER_TILES = {
  borderBottom: border('Border bottom', ['bottom', 'outer'], null, 1, 'border'),
  borderLeft: border('Border left', ['left', 'outer'], null, 1, 'border'),
  borderRight: border('Border right', ['right', 'outer'], null, 1, 'border'),
  borderTop: border('Border up', ['top', 'outer'], null, 1, 'border'),
  borderInnerCornerTopRight: border('Border corner inner 1', ['top', 'right', 'inner'], null, 1, 'border'),
  borderInnerCornerTopLeft: border('Border corner inner 2', ['top', 'left', 'inner'], null, 1, 'border'),
  borderInnerCornerBottomLeft: border('Border corner inner 3', ['bottom', 'left', 'inner'], null, 1, 'border'),
  borderInnerCornerBottomRight: border('Border corner inner 4', ['bottom', 'right', 'inner'], null, 1, 'border'),
  borderOuterCornerBottomLeft: border('Border corner outer 1', ['bottom', 'left', 'diagonal'], null, 1, 'border'),
  borderOuterCornerBottomRight: border('Border corner outer 2', ['bottom', 'right', 'diagonal'], null, 1, 'border'),
  borderOuterCornerTopRight: border('Border corner outer 3', ['top', 'right', 'diagonal'], null, 1, 'border'),
  borderOuterCornerTopLeft: border('Border corner outer 4', ['top', 'left', 'diagonal'], null, 1, 'border'),
}
