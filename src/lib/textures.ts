import * as THREE from "three";
import { KEYS } from "./layout";
import type { KeyboardInputs } from "./keyboard";

const BASE = "https://assets.uberdesigner.ai/vibetyper/";

// One atlas cell per key, shelf-packed in key order at 84 px per cm (2 px
// padding); each key gets a uv rect (offset.xy, scale.zw) into the 2048 × 1024
// legends image.
function atlasRects(): [number, number, number, number][] {
  const PX = 84;
  const W = 2048;
  const H = 1024;
  const rects: [number, number, number, number][] = [];
  let x = 0;
  let y = 0;
  let shelf = 0;
  for (const k of KEYS) {
    const w = Math.ceil(k.w * PX) + 4;
    const h = Math.ceil(k.d * PX) + 4;
    if (x + w > W) {
      x = 0;
      y += shelf;
      shelf = 0;
    }
    rects.push([(x + 2) / W, 1 - (y + 2 + h - 4) / H, (w - 4) / W, (h - 4) / H]);
    x += w;
    shelf = Math.max(shelf, h);
  }
  return rects;
}

export async function loadTextures(): Promise<KeyboardInputs> {
  const loader = new THREE.TextureLoader();
  const load = async (file: string, { srgb = true, aniso = 8 } = {}) => {
    const t = await loader.loadAsync(BASE + file);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    return t;
  };
  const [legends, padTexture, pcbTexture, batteryTexture, grain, smudge] = await Promise.all([
    load("legends.png", { aniso: 16 }),
    load("light-pool.png", { srgb: false, aniso: 4 }),
    load("pcb.webp"),
    load("battery.webp"),
    load("grain-normal.png", { srgb: false }),
    load("smudge.png", { srgb: false, aniso: 4 }),
  ]);
  // the surface maps tile: ExtrudeGeometry UVs are in centimetres, so repeat sets the physical scale
  const tiled = (tex: THREE.Texture, cm: number) => {
    const t = tex.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / cm, 1 / cm);
    t.needsUpdate = true;
    return t;
  };
  return {
    legend: { texture: legends, rects: atlasRects() },
    padTexture,
    pcbTexture,
    batteryTexture,
    surface: { metalNormal: tiled(grain, 1.6), capNormal: tiled(grain, 0.9), smudge: tiled(smudge, 14), capSmudge: tiled(smudge, 6) },
  };
}

/* ------------------------------------------------------------ studio env */

// A black room with a few softboxes, so the satin caps and the anodised
// frame pick up crisp product-shot highlights rather than a grey wash.
export function createStudioEnvironment(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const box = (w: number, h: number, color: number, intensity: number, pos: [number, number, number], look: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.lookAt(...look);
    scene.add(m);
  };
  box(7, 3, 0xfff4e8, 3.2, [0, 8, -3], [0, 0, 0]);
  box(14, 1.6, 0xffffff, 2.2, [0, 6.5, -10], [0, 0, 0]);
  box(14, 0.8, 0xffffff, 0.7, [0, 2.2, -10], [0, 0, 0]);
  box(2.2, 6, 0xdde6ff, 1.4, [-10, 3, 3], [0, 0, 0]);
  box(2.5, 4, 0xff8a3d, 1.3, [10, 2, -1], [0, 0, 0]);
  box(10, 1, 0xffffff, 0.6, [0, 1.5, 11], [0, 0, 0]);
  // a dim warm bounce from below, so nothing falls to pure black
  box(40, 40, 0x2a1d14, 0.35, [0, -8, 0], [0, 0, 0]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.02).texture;
  pmrem.dispose();
  scene.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return env;
}
