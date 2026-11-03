import * as THREE from "three";
import { KEYS } from "./layout";
import { LAYERS, CAP_H, type Keyboard } from "./keyboard";

// In the hero, keys rise a little under the cursor (their neighbours a touch)
// on a springy settle, and more backlight escapes from the well beneath.
// Picking is analytic: the pointer ray meets the plane of the keytops in the
// keyboard's own frame, and the hit is matched against each key's rectangle.
export function createKeyHover({ kb, camera, signal }: { kb: Keyboard; camera: THREE.Camera; signal: AbortSignal }) {
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const inv = new THREE.Matrix4();
  const ray = new THREE.Ray();
  const hit = new THREE.Vector3();
  const tops = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(LAYERS.caps.y + CAP_H / 2));
  const springs = KEYS.map(() => ({ x: 0, v: 0 }));
  const smooth = (e0: number, e1: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  };

  let px = 0;
  let py = 0;
  let inside = false;
  addEventListener(
    "pointermove",
    (e) => {
      px = (e.clientX / innerWidth) * 2 - 1;
      py = -((e.clientY / innerHeight) * 2 - 1);
      inside = true;
    },
    { signal },
  );
  document.documentElement.addEventListener("pointerleave", () => (inside = false), { signal });
  // a finger lifting off shouldn't leave a key raised
  addEventListener("pointerup", (e) => e.pointerType !== "mouse" && (inside = false), { signal });

  // weight: 1 in the hero, 0 elsewhere
  function update(dt: number, weight: number) {
    let hx = Infinity;
    let hz = Infinity;
    if (weight > 0.01 && inside) {
      ndc.set(px, py);
      raycaster.setFromCamera(ndc, camera);
      inv.copy(kb.root.matrixWorld).invert();
      ray.copy(raycaster.ray).applyMatrix4(inv);
      if (ray.intersectPlane(tops, hit)) {
        hx = hit.x;
        hz = hit.z;
      }
    }
    const h = Math.min(dt, 1 / 30);
    for (let i = 0; i < KEYS.length; i++) {
      const k = KEYS[i];
      // distance from the hit to the key's rectangle (0 when on it)
      const ox = Math.max(0, Math.abs(hx - k.x) - k.w / 2);
      const oz = Math.max(0, Math.abs(hz - k.z) - k.d / 2);
      const out = Math.hypot(ox, oz);
      const target = (out === 0 ? 1 : 0.35 * (1 - smooth(0, 1.4, out))) * weight;
      // a spring a little under critical damping: it overshoots, then settles
      const s = springs[i];
      s.v += ((target - s.x) * 190 - s.v * 19) * h;
      s.x += s.v * h;
      const st = kb.keys[i];
      st.hover = s.x;
      st.orange += Math.max(0, s.x) * 0.9;
    }
  }

  return { update };
}
