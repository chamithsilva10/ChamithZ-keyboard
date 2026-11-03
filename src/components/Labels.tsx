import type { Ref } from "react";
import styles from "./Labels.module.css";

const LAYERS = [
  { id: "caps", title: "Keycaps", note: "Double-shot PBT · four ember action keys" },
  { id: "switch", title: "Mechanical switches", note: "Low-profile linear · hot-swap" },
  { id: "plate", title: "Plate", note: "Aluminium · holds every switch" },
  { id: "foam", title: "Dampening foam", note: "Latex and IXPE · a deeper, quieter sound" },
  { id: "pcb", title: "Logic board", note: "Hot-swap · per-key light · ultra-low latency" },
  { id: "battery", title: "Battery", note: "2,980 mAh · three months a charge" },
  { id: "base", title: "Unibody case", note: "CNC-machined recycled aluminium" },
];

const PARTS = [
  { id: "cap", title: "Accept key", note: "Ember PBT · etched ✓" },
  { id: "switch", title: "Linear switch", note: "Pre-lubed · 3.2 mm travel" },
  { id: "spring", title: "Spring", note: "A lighter 45 g press" },
  { id: "pad", title: "Key light", note: "Glows when a change is waiting" },
];

export interface LabelsProps {
  ref?: Ref<HTMLDivElement>;
}

export function Labels({ ref }: LabelsProps) {
  return (
    <div ref={ref} className={styles.container}>
      {LAYERS.map((layer) => (
        <div
          key={layer.id}
          className={`${styles.label} ${styles.left}`}
          data-layer={layer.id}
        >
          <div className={styles.box}>
            <b>{layer.title}</b>
            <span>{layer.note}</span>
          </div>
        </div>
      ))}
      {PARTS.map((part) => (
        <div
          key={part.id}
          className={`${styles.label} ${styles.right}`}
          data-part={part.id}
        >
          <div className={styles.box}>
            <b>{part.title}</b>
            <span>{part.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
