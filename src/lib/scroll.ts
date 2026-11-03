import gsap from "gsap";
import { KEYS, VIBE, ACCEPT_INDEX } from "./layout";
import { LAYER_ORDER, type Keyboard } from "./keyboard";
import { BACKLIGHT } from "./preloader";
import type { Rig } from "./rig";
import type { Post } from "./post";
import type { Stage } from "./stage";
import type { UiRefs } from "./ui";

// Scroll is mapped onto one paused timeline 12 units long. The page only
// supplies a progress value; the render loop eases toward it, so the same
// timeline can be pinned to any frame.
//
//   0    – 1.6   flatten the floating keyboard, swing round to a three-quarter view
//   0.6  – 3.8   split vertically into seven layers, labels arrive
//   3.5  – 4.9   hold, slow orbit
//   4.9  – 6.7   layers close up while the camera settles on the vibe row
//   6.75 – 8.45  prompt, talk, reject, accept light up in turn
//   8.5  – 10.7  zoom onto accept; it splits into cap / switch / spring / light
//   10.9 – 12    accept closes, presses, and the glow floods out from it
const smooth = (a: number, b: number, t: number) => {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};

// how far the accept key's parts rise when it comes apart
export const SPLIT = { cap: 2.25, switch: 1.4, spring: 0.36 };

export interface Glow {
  backlight: number;
  vibe: number;
  step: number; // which vibe key is showing off (0–3), fractional in between
  press: number; // the accept press at the end
  wave: number;
  key: number;
  labels: number;
  partLabels: number;
}

export type Scroll = ReturnType<typeof createScroll>;

export function createScroll({ kb, rig, post, stage, ui, signal }: { kb: Keyboard; rig: Rig; post: Post; stage: Stage; ui: UiRefs; signal: AbortSignal }) {
  const { cam } = rig;
  const { fx } = post;
  const hero = KEYS[ACCEPT_INDEX];
  const heroKey = kb.keys[ACCEPT_INDEX];
  const row = VIBE.map((i) => KEYS[i]);
  const rowX = (row[0].x + row[3].x) / 2;
  const kbY = stage.kbPose.y;

  const glow: Glow = { backlight: BACKLIGHT, vibe: 0.9, step: -1, press: 0, wave: 0, key: 0, labels: 0, partLabels: 0 };
  stage.focusOverride = null;

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });

  // flatten + frame the stack
  tl.to(ui.hero, { autoAlpha: 0, y: -30, filter: "blur(10px)", duration: 0.7, ease: "power1.in" }, 0);
  tl.to(ui.scrollCue, { opacity: 0, duration: 0.3 }, 0);
  tl.to(stage.kbPose, { rx: 0, duration: 1.6 }, 0);
  tl.to(stage, { idle: 0.25, duration: 1.2 }, 0);
  tl.to(stage, { hoverKeys: 0, duration: 0.35 }, 0);
  tl.to(cam, { ty: kbY + 2.0, tz: 0, az: -0.42, el: 0.3, dist: 66, fov: 30, shiftX: -0.02, shiftY: 0.03, parallax: 0.6, duration: 1.8 }, 0);
  tl.to(stage, { shadow: 0.3, duration: 1.6 }, 0.8);
  tl.to(fx, { bokeh: 0.35, focusRange: 40, duration: 1.6 }, 0);

  // split
  LAYER_ORDER.forEach((name, i) => {
    tl.to(kb.explode, { [name]: 1, duration: 2.1, ease: "power3.inOut" }, 0.6 + i * 0.17);
  });
  tl.to(glow, { backlight: 1.05, duration: 1.6 }, 1.2);
  tl.to(glow, { labels: 1, duration: 0.01 }, 1.4);
  tl.fromTo(ui.inside, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out" }, 2.0);

  // hold + orbit
  tl.to(cam, { az: -0.24, el: 0.24, duration: 1.4, ease: "sine.inOut" }, 3.5);

  // close up onto the vibe row
  tl.to(ui.inside, { autoAlpha: 0, y: -20, duration: 0.6, ease: "power1.in" }, 4.7);
  tl.to(glow, { labels: 0, duration: 0.01 }, 4.85);
  [...LAYER_ORDER].reverse().forEach((name, i) => {
    tl.to(kb.explode, { [name]: 0, duration: 1.5, ease: "power3.inOut" }, 4.9 + i * 0.1);
  });
  tl.to(glow, { backlight: 0.14, duration: 1.4 }, 5.2);
  tl.to(stage, { shadow: 1, duration: 1.2 }, 5.2);
  tl.to(stage, { idle: 0, duration: 1 }, 5.0);
  tl.to(cam, { tx: rowX, ty: kbY + 1.45, tz: row[0].z, az: -0.12, el: 0.6, dist: 17, shiftX: 0.16, shiftY: 0.02, fit: 0.8, parallax: 0.35, duration: 1.8, ease: "power3.inOut" }, 4.9);
  tl.to(fx, { bokeh: 3.2, focusRange: 6, duration: 1.6 }, 5.0);
  tl.fromTo(ui.vibeCopy, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 6.5);
  tl.fromTo(glow, { step: -0.6 }, { step: 3.6, duration: 1.7, ease: "none" }, 6.75);
  tl.to(cam, { az: -0.02, duration: 1.7, ease: "sine.inOut" }, 6.75);

  // zoom onto accept, which splits into its parts
  tl.to(ui.vibeCopy, { autoAlpha: 0, y: -20, duration: 0.5, ease: "power1.in" }, 8.45);
  tl.to(cam, { tx: hero.x - 0.3, ty: kbY + 1.9, tz: hero.z - 0.2, az: -0.5, el: 0.4, dist: 11, shiftY: 0, portraitLift: 0.12, fit: 0, duration: 1.2, ease: "power3.inOut" }, 8.5);
  tl.to(fx, { bokeh: 5.5, focusRange: 2.6, duration: 1.1 }, 8.6);
  tl.to(stage, { tilt: 0.3, duration: 1.1 }, 8.5);
  tl.to(heroKey, { parts: 1, duration: 0.01 }, 9.5);
  tl.to(heroKey.lift, { cap: SPLIT.cap, switch: SPLIT.switch, spring: SPLIT.spring, duration: 1.1, ease: "power3.inOut" }, 9.55);
  tl.to(glow, { key: 2.4, duration: 0.9 }, 9.6);
  // (on portrait screens the taller stack backs off and rises above the copy)
  tl.to(cam, { ty: kbY + 2.3, el: 0.2, az: -0.42, dist: 9.6, shiftX: 0.06, shiftY: -0.15, fit: 0.32, portraitLift: 0.22, duration: 1.2, ease: "power2.inOut" }, 9.5);
  tl.to(fx, { focusRange: 5, duration: 1 }, 9.6);
  tl.to(glow, { partLabels: 1, duration: 0.01 }, 10.25);
  tl.fromTo(ui.keyCopy, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }, 10.3);

  // close, press, flood
  tl.to(glow, { partLabels: 0, duration: 0.01 }, 10.9);
  tl.to(ui.keyCopy, { autoAlpha: 0, y: -20, duration: 0.5, ease: "power1.in" }, 10.85);
  tl.to(heroKey.lift, { cap: 0, switch: 0, spring: 0, duration: 0.6, ease: "power3.inOut" }, 10.95);
  tl.to(glow, { press: 0.09, duration: 0.15, ease: "power2.in" }, 11.5);
  tl.to(glow, { wave: 1, duration: 0.45, ease: "none" }, 11.5);
  tl.to(glow, { backlight: 1.2, duration: 0.45 }, 11.5);
  tl.to(cam, { tx: 1, ty: kbY + 1.6, tz: 1.5, az: -0.25, el: 0.5, dist: 33, fit: 0.6, shiftX: 0, shiftY: -0.2, portraitLift: 0, parallax: 1, duration: 1.05, ease: "power2.inOut" }, 10.95);
  tl.to(fx, { bokeh: 2.6, focusRange: 7, duration: 1.0 }, 10.95);
  tl.to(stage, { tilt: 1, duration: 1.0 }, 10.95);
  tl.fromTo(ui.final, { autoAlpha: 0, y: 30, filter: "blur(10px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power3.out" }, 11.55);
  tl.set(heroKey, { parts: 0 }, 11.55);

  /* ------------------------------------------------- progress + per frame */

  let target = 0;
  let current = 0;
  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  const readScroll = () => {
    const max = maxScroll();
    target = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  };
  addEventListener("scroll", readScroll, { passive: true, signal });
  readScroll();

  // nav jumps glide the timeline to a section (through everything in
  // between) rather than snapping; any scroll input takes over again
  const glide = { p: 0, active: false };
  const release = () => {
    if (!glide.active) return;
    gsap.killTweensOf(glide);
    glide.active = false;
  };
  for (const type of ["wheel", "touchstart", "keydown"]) addEventListener(type, release, { passive: true, signal });

  function goTo(p: number) {
    gsap.killTweensOf(glide);
    Object.assign(glide, { p: current, active: true });
    gsap.to(glide, {
      p,
      duration: 0.9 + Math.abs(p - current) * 2.2,
      ease: "power2.inOut",
      onComplete: () => {
        glide.active = false;
      },
    });
    target = p;
    scrollTo({ top: p * maxScroll(), behavior: "instant" });
  }

  function update(dt: number) {
    if (glide.active) current = glide.p;
    else current += (target - current) * (1 - Math.exp(-dt * 5));
    if (Math.abs(target - current) < 1e-5) current = target;
    tl.progress(current);

    // keys sit still; the light, the vibe row and the accept key change
    const waveR = glow.wave * 40;
    for (let i = 0; i < KEYS.length; i++) {
      const st = kb.keys[i];
      st.off.set(0, 0, 0);
      st.q.identity();
      st.s = 1;
      st.press = 0;
      const d = Math.hypot(KEYS[i].x - hero.x, KEYS[i].z - hero.z);
      const front = Math.max(0, Math.min(1, (waveR - d) / 4));
      const crest = front * Math.exp(-Math.max(0, waveR - d) / 6);
      st.white = 0;
      st.orange = glow.backlight + crest * 2.4;
    }
    VIBE.forEach((i, j) => {
      const st = kb.keys[i];
      const bump = smooth(0.65, 0.2, Math.abs(glow.step - j));
      st.orange = Math.max(st.orange, glow.vibe) + bump * 2.4;
      st.press = 0.08 * bump;
    });
    heroKey.press += glow.press;
    heroKey.orange += glow.key;
    kb.look.mic = 0.2 + smooth(0.65, 0.2, Math.abs(glow.step - 1)) * 0.8;
    stage.focusOverride = heroKey.parts > 0.5 ? "keyStack" : null;
  }

  function pin(p: number) {
    release();
    target = current = p;
    tl.progress(p);
  }

  const isSettled = () => !glide.active && Math.abs(target - current) < 1e-4;

  function dispose() {
    gsap.killTweensOf(glide);
    tl.kill();
  }

  return { tl, update, pin, goTo, isSettled, glow, progress: () => current, dispose };
}
