// The DOM the 3D experience drives: React renders it, the timelines fade and
// move it (see preloader.ts, scroll.ts) and the labels follow the model.
export interface UiRefs {
  veil: HTMLElement;
  nav: HTMLElement;
  hero: HTMLElement;
  scrollCue: HTMLElement;
  inside: HTMLElement;
  vibeCopy: HTMLElement;
  keyCopy: HTMLElement;
  final: HTMLElement;
  labels: HTMLElement;
}

// Where each nav link lands on the scroll timeline (progress 0–1): the hero,
// the split layers with their callouts, the vibe row as it starts lighting
// up, and the accept key split into its parts.
export const SECTIONS = { overview: 0, inside: 0.34, "vibe-row": 0.57, specs: 0.88 } as const;
export type SectionName = keyof typeof SECTIONS;
export const sectionAt = (p: number): SectionName | null =>
  p < 0.17 ? "overview" : p < 0.46 ? "inside" : p < 0.72 ? "vibe-row" : p < 0.95 ? "specs" : null;
export const isSection = (name: string): name is SectionName => name in SECTIONS;
