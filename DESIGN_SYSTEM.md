# OBJECTS Design System

## Brand Colors (Burgundy Theme)

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-primary` | `#8B1E2B` | Primary brand color, buttons, selection borders |
| `--accent-light` | `#A83248` | Lighter accent, hover states, gradients |
| `--accent-gradient` | `linear-gradient(135deg, #A83248 0%, #8B1E2B 100%)` | Brand gradient for CTAs |

## Backgrounds (Dark Glassmorphism)

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-canvas` | `#0a0808` | Main canvas background |
| `--bg-panel` | `rgba(20, 20, 20, 0.98)` | Panels, sidebars, header |
| `--bg-panel-header` | `rgba(30, 30, 30, 0.98)` | Toolbar, dropdowns |
| `--bg-input` | `rgba(255, 255, 255, 0.04)` | Input fields background |
| `--bg-hover` | `rgba(255, 255, 255, 0.06)` | Hover state |
| `--bg-active` | `rgba(255, 255, 255, 0.12)` | Active/pressed state |
| `--bg-selected` | `rgba(139, 30, 43, 0.3)` | Selected item background |

## Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Panel borders, dividers |
| `--border-default` | `rgba(255, 255, 255, 0.12)` | Input borders |
| `--border-hover` | `rgba(255, 255, 255, 0.15)` | Hover state borders |
| `--border-focus` | `rgba(168, 50, 72, 0.6)` | Focus ring (brand color) |

## Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#fafafa` | Primary text, headings |
| `--text-secondary` | `#a1a1aa` | Secondary text, labels |
| `--text-tertiary` | `#71717a` | Muted text, placeholders |
| `--text-disabled` | `#3f3f46` | Disabled state |

## Selection States

### Canvas Element Selection
```css
/* Selected element */
border: 2px solid #8B1E2B;
box-shadow: 0 0 0 2px #A83248; /* For artboards */

/* Hovered element */
border: 1px solid #8B1E2B;

/* Selected in auto-layout */
outline: 2px solid #8B1E2B;
outline-offset: -2px;
```

### Layer/Sidebar Selection
```css
/* Selected item */
background: rgba(168, 50, 72, 0.15);
border-left: 2px solid #A83248;
color: #fff;

/* Hovered item */
background: rgba(255, 255, 255, 0.04);
```

### Tab Selection
```css
/* Active tab */
border-bottom: 2px solid #A83248;
color: #fff;

/* Inactive tab */
border-bottom: 2px solid transparent;
color: #71717a;
```

## Button States

### Primary Button (CTA)
```css
background: linear-gradient(135deg, #A83248 0%, #8B1E2B 100%);
border: none;
color: #fff;

/* Hover */
filter: brightness(1.1);
```

### Secondary Button
```css
background: transparent;
border: 1px solid rgba(255, 255, 255, 0.1);
color: #888;

/* Hover */
background: rgba(255, 255, 255, 0.06);
border-color: rgba(255, 255, 255, 0.15);
color: #fff;
```

### Tool Button (Toolbar)
```css
/* Default */
background: transparent;
color: #888;

/* Hover */
background: rgba(255, 255, 255, 0.06);
color: #bbb;

/* Active */
background: rgba(255, 255, 255, 0.12);
color: #fff;
```

## Effects

### Blur (Glassmorphism)
```css
backdrop-filter: blur(20px);
```

### Shadows
```css
/* Panel shadow */
box-shadow: 0 20px 70px -10px rgba(0, 0, 0, 0.7);

/* Toolbar shadow (with brand glow) */
box-shadow:
  0 0 0 1px rgba(0, 0, 0, 0.5),
  0 20px 70px -10px rgba(0, 0, 0, 0.7),
  0 0 40px rgba(0, 0, 0, 0.3),
  0 0 0 2px rgba(168, 50, 72, 0.3);

/* Selected artboard */
box-shadow: 0 25px 100px rgba(0,0,0,0.5), 0 0 0 2px #A83248;
```

## Resize Handles

```css
/* Handle */
width: 8px;
height: 8px;
background: #8B1E2B;
border-radius: 2px;
```

## Input Fields

```css
background: rgba(255, 255, 255, 0.04);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 6px;
color: #fff;
font-size: 12px;

/* Focus */
border-color: rgba(168, 50, 72, 0.6);
outline: none;
```

## Color Palette Presets

```javascript
const BRAND_COLORS = [
  '#8B1E2B',  // Primary burgundy
  '#A83248',  // Light burgundy
  '#C94C5C',  // Accent light
  '#5C1018',  // Dark burgundy
];

const UI_GRAYS = [
  '#000000',
  '#0a0808',  // Canvas
  '#141414',  // Panels
  '#1e1e1e',  // Elevated
  '#27272a',  // Legacy (avoid)
  '#3f3f46',
  '#71717a',
  '#a1a1aa',
  '#fafafa',
  '#ffffff',
];
```

## Migration Notes

Replace legacy values:
- `#27272a` → `rgba(255, 255, 255, 0.08)` for borders
- `#1a1a1a` → `rgba(20, 20, 20, 0.98)` for backgrounds
- `#111` → `rgba(20, 20, 20, 0.98)` for panels
- `#333` → `rgba(255, 255, 255, 0.12)` for borders
