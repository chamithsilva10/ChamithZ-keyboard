# ChamithZ Keyboard

A one-page product site for **ChamithZ**, a low-profile wireless mechanical keyboard for Mac with a dedicated action row.

## Overview
The entire page is a fixed, real-time 3D scene built in Three.js underneath a fixed typography layer. Page scroll drives a continuous timeline exploring the keyboard's architecture, materials, and switch mechanics.

## Features
- **Real-Time 3D Rendering**: Built with Three.js (`three@0.186.1`), custom GLSL shader hooks (`onBeforeCompile`), and instanced meshes for 80 low-profile keys.
- **Continuous Preloader Flight**: Camera flight through the internal PCB, switch lanes, and keycap assembly.
- **Scroll-Driven Sequence**: Scrubbed GSAP timeline splitting the keyboard into its 7 structural layers with dynamic leader-line callouts.
- **Action Row & Switch Disassembly**: Focused exploration of the four action keys, with the accept key breaking down into cap, switch housing, coil spring, and LED pad.
- **Interactive Physics**: Cursor hover lifting keys on an under-damped spring with real-time keyboard lean.
- **Post-Processing Pipeline**: N8AO ambient occlusion, Depth of Field bokeh, camera motion blur, bloom, AgX tone mapping, vignette, and film noise.
- **Responsive Design**: Full desktop, tablet, and mobile layouts with adaptive pixel ratio scaling.

## Tech Stack
- **Framework**: React 19 + TypeScript (`strict: true`)
- **Bundler**: Vite
- **Graphics & 3D**: Three.js `0.186.1`
- **Post-Processing**: `postprocessing@6.39.5` + `n8ao@2.0.1`
- **Animation**: GSAP `3.15.0`
- **Styling**: CSS Modules with design tokens

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```
