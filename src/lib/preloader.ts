import * as THREE from "three";
import gsap from "gsap";
import { KEYS } from "./layout";
import { LAYERS, type Keyboard } from "./keyboard";
import { flightAt, keyTimes, FLIGHT_END, KB_Y, BOARD_SLIDE, BOARD_DROP } from "./flight";
import type { Rig } from "./rig";
import type { Post } from "./post";
import type { Stage } from "./stage";
import type { UiRefs } from "./ui";

// The preloader: one continuous camera move (see flight.ts).
//   0     skim the logic board, slid out beside the keys, its lights waking
//   0.8   climb into the lane between two rows of switches and run along it
//   1.3   up out over the bare switches, rolling, as the caps rain in
//   2.4   level with the front edge as the vibe row lands
//   3.9   pull back into the hero
export const BACKLIGHT = 0.42;
const T = { lane: keyTimes[3], out: keyTimes[5], edge: keyTimes[7], end: FLIGHT_END };

// caps fall this far (cm) onto their switches, so they hang in the air above
// the board as they come in
const DROP = 4.2;
const DROP_TIME = 0.5;
const backOut = gsap.parseEase("back.out(1.3)");
const smooth = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

// The caps all come once the camera is up out of the lane: one wave that
// runs away from it down the length of the board, the rows a beat apart.
const along = (k: (typeof KEYS)[number]) => (k.x + 14) / 28;
const startOf = KEYS.map((k) => T.out - 0.15 + along(k) * 1.15 + Math.abs(k.row - 3.5) * 0.04);
// each cap tips in from a slightly different angle
let seed = 11;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const tip = KEYS.map(() => new THREE.Euler(rnd() * 0.28, rnd() * 0.12, rnd() * 0.22));

export type Preloader = ReturnType<typeof createPreloader>;

export function createPreloader({ kb, rig, post, stage, ui, onDone }: { kb: Keyboard; rig: Rig; post: Post; stage: Stage; ui: UiRefs; onDone: () => void }) {
  const { cam, flight } = rig;
  const { fx } = post;
  const tl = gsap.timeline({ paused: true });

  // the orbit is parked on the hero shot from the start; the flight lands on
  // the same spot and hands over to it at the end
  Object.assign(cam, { tx: 0, ty: 5.1, tz: 0.9, az: -0.06, el: 0.2, dist: 46, fov: 30, roll: 0, fit: 1, shiftX: 0, shiftY: -0.085, parallax: 0, shake: 0 });
  // (motionBlur: a film shutter while the camera flies)
  Object.assign(fx, { bokeh: 1.5, focusRange: 3, bloom: 1.1, focusRow: 0, motionBlur: 1 });
  Object.assign(flight, { mix: 1, near: 0.04 });
  Object.assign(stage, { desk: 0, idle: 0, tilt: 0, shadow: 0.5, hoverKeys: 0, light: 0.3, rim: 0.1, rake: 1 });
  Object.assign(stage.kbPose, { y: KB_Y, rx: 0, ry: 0, rz: 0 });
  // the logic board, battery and base start slid out and dropped below
  for (const name of ["pcb", "battery", "base"] as const) {
    kb.explode[name] = BOARD_DROP / -LAYERS[name].lift;
    kb.slide[name] = BOARD_SLIDE;
  }
  Object.assign(kb.explode, { caps: 0, switch: 0, plate: 0, foam: 0 });
  // the board reads a touch brighter than it does inside the closed case
  const board = kb.mats.pcbTop;
  const boardGlow = { v: 0.55 };
  const glow = { level: 1.0 };
  const ao = post.ao.configuration;
  const aoState = { radius: 0.1 };

  // the board slides home under the keys while the camera is in the lane,
  // then rises into place
  for (const name of ["pcb", "battery", "base"] as const) {
    tl.to(kb.slide, { [name]: 0, duration: 0.7, ease: "power2.inOut" }, T.lane + 0.1);
    tl.to(kb.explode, { [name]: 0, duration: 0.35, ease: "power2.out" }, T.lane + 0.8);
  }

  // inside it's dark but for the board's lights; the studio comes up as the
  // camera rises out
  tl.to(stage, { light: 1, duration: 0.7, ease: "sine.inOut" }, T.out - 0.2);
  tl.to(stage, { shadow: 1, duration: 0.8, ease: "sine.inOut" }, T.out);
  tl.to(glow, { level: BACKLIGHT, duration: 1.0, ease: "sine.inOut" }, T.edge - 0.3);
  tl.to(aoState, { radius: 0.45, duration: 0.8, ease: "sine.inOut" }, T.out);
  tl.to(boardGlow, { v: 0.22, duration: 0.5 }, T.lane + 0.6);
  // the lens opens up as the camera rises out, then settles into product shot
  tl.to(fx, { bokeh: 1.2, focusRange: 6, duration: 0.5, ease: "sine.inOut" }, T.out - 0.2);
  tl.to(fx, { bokeh: 0.5, focusRange: 18, duration: 1.0, ease: "sine.inOut" }, T.edge);
  // the keyboard tips toward us as it's revealed
  tl.to(stage.kbPose, { rx: 0.36, duration: T.end - keyTimes[8] + 0.25, ease: "power2.inOut" }, keyTimes[8] - 0.25);
  tl.to(flight, { mix: 0, duration: 1.0, ease: "power2.inOut" }, T.end - 1.0);
  tl.to(stage, { rim: 1, duration: 0.6, ease: "sine.inOut" }, T.end - 0.6);
  // the low light across the board fades as the camera leaves it
  tl.to(stage, { rake: 0, duration: 0.5, ease: "sine.inOut" }, T.lane - 0.3);
  tl.to(fx, { motionBlur: 0, duration: 0.8, ease: "sine.inOut" }, T.end - 1.0);
  tl.to(stage, { idle: 1, tilt: 1, duration: 1.0, ease: "sine.inOut" }, T.end - 0.8);
  tl.to(stage, { hoverKeys: 1, duration: 0.5, ease: "sine.out" }, T.end - 0.5);
  tl.to(cam, { parallax: 1, duration: 1, ease: "sine.inOut" }, T.end - 0.8);

  /* UI */
  gsap.set([ui.hero, ui.inside, ui.vibeCopy, ui.keyCopy, ui.final], { autoAlpha: 0 });
  gsap.set(ui.nav, { autoAlpha: 1 });
  tl.fromTo(ui.veil, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, 0);
  tl.fromTo(ui.hero, { autoAlpha: 0, y: 24, filter: "blur(12px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.0, ease: "power3.out" }, T.end - 0.9);
  tl.call(() => onDone(), undefined, T.end);

  /* ------------------------------------------------------------- clock */

  // The timeline is stepped from the render loop rather than gsap's ticker,
  // and a slow frame only advances it by a capped amount: a hitch slows the
  // flight down for a moment instead of making it jump.
  let playing = false;
  function play() {
    tl.time(0);
    playing = true;
  }
  function advance(dt: number) {
    if (!playing) return;
    const t = Math.min(T.end, tl.time() + Math.min(dt, 1 / 30));
    tl.time(t);
    if (t >= T.end) playing = false;
  }

  /* ------------------------------------------------------ per-frame state */

  const q = new THREE.Quaternion();

  function update() {
    const t = tl.time();
    flightAt(t, flight);
    if (ao.aoRadius !== aoState.radius) ao.aoRadius = aoState.radius;
    board.emissiveIntensity = boardGlow.v;

    // the board's lights wake in a wave that runs on ahead of the camera
    const wave = -31 + t * 32;
    for (let i = 0; i < KEYS.length; i++) {
      const k = KEYS[i];
      const st = kb.keys[i];
      st.led = kb.slide.pcb === 0 ? 1 : smooth((wave - (k.x + kb.slide.pcb)) / 1.5);

      // caps materialise a little way up, then drop onto their switches
      const b = (t - startOf[i]) / DROP_TIME;
      const land = b <= 0 ? 0 : b >= 1 ? 1 : backOut(b);
      st.off.set(0, DROP * (1 - land), 0);
      st.s = smooth(b * 3.5);
      st.q.setFromEuler(tip[i]).slerp(q.identity(), b <= 0 ? 0 : b >= 1 ? 1 : 1 - (1 - b) ** 3);
      st.press = 0;
      st.white = 0;
      st.inner = 1;
      // an empty well glows full; each key flares as its cap lands, then
      // settles to the backlight
      const since = t - (startOf[i] + DROP_TIME * 0.55);
      const flare = since > 0 ? (1 - Math.exp(-since * 30)) * Math.exp(-since * 5) * 0.9 : 0;
      const w = smooth((b - 0.5) * 2);
      st.orange = 1.0 * (1 - w) + glow.level * w + flare;
    }
    kb.look.mic = 0.2;
  }

  return { tl, play, advance, update, end: T.end };
}
