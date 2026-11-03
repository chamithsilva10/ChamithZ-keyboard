import * as THREE from "three";
import { KEYS, ACCEPT_INDEX } from "./layout";
import { SPLIT, type Glow } from "./scroll";
import type { Keyboard, KeyPart, LayerName } from "./keyboard";

// Leader-line callouts pinned to 3D anchors. Layer labels sit left of
// whichever corner of their layer is furthest left on screen, so the text
// never lies over the stack; the accept key's part labels sit to the right of
// its lifted parts.
export function createLabels({ kb, camera, root }: { kb: Keyboard; camera: THREE.Camera; root: HTMLElement }) {
  const layerEls = Array.from(root.querySelectorAll<HTMLElement>("[data-layer]"));
  const partEls = Array.from(root.querySelectorAll<HTMLElement>("[data-part]"));
  const v = new THREE.Vector3();
  const hero = KEYS[ACCEPT_INDEX];
  const sm = (a: number, b: number, t: number) => {
    const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
    return x * x * (3 - 2 * x);
  };

  const toScreen = (world: THREE.Vector3, w: number, h: number, out: THREE.Vector3) => {
    out.copy(world).project(camera);
    out.set((out.x * 0.5 + 0.5) * w, (-out.y * 0.5 + 0.5) * h, out.z);
    return out;
  };
  const show = (el: HTMLElement, x: number, y: number, z: number, alpha: number) => {
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.style.opacity = alpha.toFixed(3);
    el.style.visibility = alpha > 0.01 && z < 1 ? "visible" : "hidden";
  };
  const place = (el: HTMLElement, world: THREE.Vector3, w: number, h: number, alpha: number) => {
    toScreen(world, w, h, v);
    show(el, v.x, v.y, v.z, alpha);
  };
  const s = new THREE.Vector3();
  const hide = (el: HTMLElement) => {
    el.style.visibility = "hidden";
  };
  // a point in the keyboard's own frame, nudged, back to world
  const nudge = (world: THREE.Vector3, dx: number, dy: number, dz: number) => {
    kb.root.worldToLocal(world);
    world.x += dx;
    world.y += dy;
    world.z += dz;
    return kb.root.localToWorld(world);
  };

  const none = { labels: 0, partLabels: 0 };

  const LEAD = 46; // css leader length
  const tips = new Map<HTMLElement, { tip: THREE.Vector3; a: number }>();

  function update(w: number, h: number, g: Pick<Glow, "labels" | "partLabels"> = none) {
    // every layer's left-most corner; the text lines up in one column left of
    // the whole stack and each leader stretches to reach its own layer
    let column = Infinity;
    tips.clear();
    for (const el of layerEls) {
      const name = el.dataset.layer as LayerName;
      const a = g.labels * sm(0.7, 0.98, kb.explode[name]);
      if (a <= 0.01) continue;
      let best: THREE.Vector3 | null = null;
      for (const c of kb.layerCorners(name)) {
        toScreen(c, w, h, s);
        if (!best || s.x < best.x) best = s.clone();
      }
      tips.set(el, { tip: best!, a });
      column = Math.min(column, best!.x);
    }
    for (const el of layerEls) {
      const t = tips.get(el);
      if (!t) {
        hide(el);
        continue;
      }
      el.style.setProperty("--lead", `${(LEAD + t.tip.x - column).toFixed(1)}px`);
      show(el, t.tip.x, t.tip.y, t.tip.z, t.a);
    }

    const split = kb.keys[ACCEPT_INDEX].lift.cap / SPLIT.cap;
    for (const el of partEls) {
      const a = g.partLabels * sm(0.75, 1, split);
      if (a <= 0.01) {
        hide(el);
        continue;
      }
      kb.keyPart(ACCEPT_INDEX, el.dataset.part as KeyPart, v);
      place(el, nudge(v, hero.w / 2 + 0.25, 0, 0), w, h, a);
    }
  }

  return { update };
}
