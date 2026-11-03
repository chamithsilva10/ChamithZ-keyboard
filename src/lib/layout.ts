// Mac ANSI layout, low-profile proportions. Units are centimetres: one key
// unit (u) is a 19 mm pitch. Rows run back (function row) to front (fn row).

export const U = 1.9;
export const CAP_GAP = 0.38; // pitch minus cap size
export const WELL_PAD = 0.07; // clearance between a cap and its well wall
export const MARGIN = 0.6;

export type VibeKind = "prompt" | "talk" | "reject" | "accept";
export type ArrowDir = "left" | "up" | "down" | "right";

// What's printed on a cap (see textures.ts → drawLegend): one centred glyph,
// a top/bottom pair, corner and centre labels, or an icon.
export interface Legend {
  c?: string;
  t?: string;
  b?: string;
  bl?: string;
  br?: string;
  bc?: string;
  tl?: string;
  tr?: string;
  small?: boolean;
  fkey?: number;
  icon?: "touch" | "globe";
  led?: boolean;
  arrow?: ArrowDir;
  vibe?: VibeKind;
  // placement: a half-height key aligned to the top or bottom of its row,
  // and the down arrow, which shares the up arrow's column
  h?: number;
  align?: "top" | "bottom";
  stack?: boolean;
}

export interface Key {
  id: string;
  index: number;
  row: number;
  x: number;
  z: number;
  w: number;
  d: number;
  wellW: number;
  wellD: number;
  legend: Legend;
  vibe: VibeKind | null;
  letter: string | null;
}

const half = 0.55;

type KeyDef = [id: string, width: number, legend: Legend];
const L = (c: string): Legend => ({ c });
const N = (t: string, b: string): Legend => ({ t, b });

const ROWS: { h: number; keys: KeyDef[] }[] = [
  {
    h: half,
    keys: [
      ["esc", 1.5, { bl: "esc", small: true }],
      ...Array.from({ length: 12 }, (_, i): KeyDef => [`F${i + 1}`, 1, { fkey: i + 1 }]),
      ["power", 1, { icon: "touch" }],
    ],
  },
  {
    h: 1,
    keys: [
      ["`", 1, N("~", "`")],
      ["1", 1, N("!", "1")],
      ["2", 1, N("@", "2")],
      ["3", 1, N("#", "3")],
      ["4", 1, N("$", "4")],
      ["5", 1, N("%", "5")],
      ["6", 1, N("^", "6")],
      ["7", 1, N("&", "7")],
      ["8", 1, N("*", "8")],
      ["9", 1, N("(", "9")],
      ["0", 1, N(")", "0")],
      ["-", 1, N("_", "–")],
      ["=", 1, N("+", "=")],
      ["delete", 1.5, { br: "delete", small: true }],
    ],
  },
  {
    h: 1,
    keys: [
      ["tab", 1.5, { bl: "tab", tl: "⇥", small: true }],
      ..."QWERTYUIOP".split("").map((k): KeyDef => [k, 1, L(k)]),
      ["[", 1, N("{", "[")],
      ["]", 1, N("}", "]")],
      ["\\", 1, N("|", "\\")],
    ],
  },
  {
    h: 1,
    keys: [
      ["caps", 1.75, { bl: "caps lock", led: true, small: true }],
      ..."ASDFGHJKL".split("").map((k): KeyDef => [k, 1, L(k)]),
      [";", 1, N(":", ";")],
      ["'", 1, N('"', "'")],
      ["return", 1.75, { br: "return", small: true }],
    ],
  },
  {
    h: 1,
    keys: [
      ["shift", 2.25, { bl: "shift", tl: "⇧", small: true }],
      ..."ZXCVBNM".split("").map((k): KeyDef => [k, 1, L(k)]),
      [",", 1, N("<", ",")],
      [".", 1, N(">", ".")],
      ["/", 1, N("?", "/")],
      ["rshift", 2.25, { br: "shift", tr: "⇧", small: true }],
    ],
  },
  {
    h: 1,
    keys: [
      ["fn", 1, { icon: "globe", tr: "fn", small: true }],
      ["control", 1, { tr: "⌃", bc: "control", small: true }],
      ["option", 1, { tr: "⌥", bc: "option", small: true }],
      ["command", 1.25, { tr: "⌘", bc: "command", small: true }],
      ["space", 3.25, {}],
      // the vibe row: right-hand modifiers give way to four agent keys
      ["prompt", 1, { vibe: "prompt" }],
      ["talk", 1, { vibe: "talk" }],
      ["reject", 1, { vibe: "reject" }],
      ["accept", 1, { vibe: "accept" }],
      ["left", 1, { arrow: "left", h: 0.5, align: "bottom" }],
      ["up", 1, { arrow: "up", h: 0.5, align: "top" }],
      ["down", 1, { arrow: "down", h: 0.5, align: "bottom", stack: true }],
      ["right", 1, { arrow: "right", h: 0.5, align: "bottom" }],
    ],
  },
];

const rowsDepth = ROWS.reduce((s, r) => s + r.h, 0) * U;
const rowsWidth = 14.5 * U;

export const BODY_W = rowsWidth + MARGIN * 2;
export const BODY_D = rowsDepth + MARGIN * 2;

// Flattened key list with centres (x, z), cap size (w, d) and well size.
export const KEYS: Key[] = (() => {
  const keys: Key[] = [];
  let z = -rowsDepth / 2;
  ROWS.forEach((row, r) => {
    let x = -rowsWidth / 2;
    const rowD = row.h * U;
    for (const [id, w, opts] of row.keys) {
      const kw = w * U;
      const kh = (opts.h ?? row.h) * U;
      let cz = z + rowD / 2;
      if (opts.align === "bottom") cz = z + rowD - kh / 2;
      if (opts.align === "top") cz = z + kh / 2;
      // the down arrow shares the up arrow's column
      if (opts.stack) x -= kw;
      const capW = kw - CAP_GAP;
      const capD = kh - CAP_GAP;
      keys.push({
        id,
        index: keys.length,
        row: r,
        x: x + kw / 2,
        z: cz,
        w: capW,
        d: capD,
        wellW: capW + WELL_PAD * 2,
        wellD: capD + WELL_PAD * 2,
        legend: opts,
        vibe: opts.vibe ?? null,
        letter: id.length === 1 && /[A-Z]/.test(id) ? id.toLowerCase() : null,
      });
      x += kw;
    }
    z += rowD;
  });
  return keys;
})();

const indexOf = (id: string) => KEYS.findIndex((k) => k.id === id);
export const VIBE = (["prompt", "talk", "reject", "accept"] as const).map(indexOf);
export const ACCEPT_INDEX = indexOf("accept");
