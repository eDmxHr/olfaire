# Brand

## Identity

**Name:** Olfaire
**Tagline:** Your Scent Intelligence
**Mascot:** Lumi — a geometric moth, Olfaire's AI guide

---

## Colors

| Token | Name | Hex |
|---|---|---|
| `parchment` | Background | `#FAF9F6` |
| `linen` | Surface / cards | `#EDEAE3` |
| `ink` | Primary text + dark UI | `#1C1A18` |
| `amber` | Accent — Lumi's signature | `#B07D2A` |
| `ash` | Muted text | `#8C8680` |
| `dust` | Borders + dividers | `#D4CFC8` |
| `red` | Destructive only | `#C4503A` |

No gradients. No additional colors. Red is used only for `IconTrash` (delete account) and conflict warning states.

---

## Typography

| Role | Font | Weights |
|---|---|---|
| Display / headings / Lumi's voice | Cormorant Garamond | 300, 400, 500, italic variants |
| Interface / labels / body / UI | DM Sans | 300, 400, 500 |

**Install:** Both fonts are on Google Fonts — free, open license.

### Type scale

| Token | Size | Usage |
|---|---|---|
| `eyebrow` | 9px | Section labels — uppercase, tracked |
| `caption` | 10px | Meta info, timestamps |
| `small` | 11px | Secondary labels |
| `body` | 12px | Body copy, settings rows |
| `ui` | 13px | Primary UI text, CTAs |
| `subhead` | 15px | Card subheadings |
| `title` | 18px | Card titles |
| `heading` | 22px | Screen headings |
| `display` | 28px | Large display |
| `hero` | 36px+ | Splash, major headings |

### Letter spacing

- Eyebrow labels: `0.22em`
- Amber accent labels: `0.16–0.18em`
- Body UI: `0.04–0.06em`

---

## Lumi — Mascot

Lumi is a geometric moth. Her amber body line is her signature — present in every variant.

### SVG files

| File | Use |
|---|---|
| `lumi.svg` | Default — ink wings on parchment |
| Variant: `wingColor="#FAF9F6"` | Dark backgrounds |
| Variant: `wingColor="#B07D2A" bodyColor="#1C1A18"` | Amber mono — small sizes |

### React Native component

```tsx
import Svg, { Path, Circle, Line } from 'react-native-svg'

export function Lumi({
  size = 48,
  wingColor = '#1C1A18',
  bodyColor = '#B07D2A',
}) {
  const h = size * (88 / 100)
  return (
    <Svg width={size} height={h} viewBox="0 0 100 88" fill="none">
      <Path d="M47 36 C42 26 22 16 8 22 C2 28 6 40 16 44 C28 48 42 44 47 40" fill={wingColor} />
      <Path d="M53 36 C58 26 78 16 92 22 C98 28 94 40 84 44 C72 48 58 44 53 40" fill={wingColor} />
      <Path d="M46 44 C38 50 22 56 18 66 C15 74 24 77 34 70 C43 64 47 56 47 48" fill={wingColor} opacity="0.75" />
      <Path d="M54 44 C62 50 78 56 82 66 C85 74 76 77 66 70 C57 64 53 56 53 48" fill={wingColor} opacity="0.75" />
      <Line x1="50" y1="26" x2="50" y2="68" stroke={bodyColor} strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="50" cy="22" r="4" fill={wingColor} />
      <Path d="M48 19 Q38 12 30 5" stroke={wingColor} strokeWidth="1.1" strokeLinecap="round" />
      <Path d="M52 19 Q62 12 70 5" stroke={wingColor} strokeWidth="1.1" strokeLinecap="round" />
      <Circle cx="30" cy="5" r="2" fill={bodyColor} />
      <Circle cx="70" cy="5" r="2" fill={bodyColor} />
    </Svg>
  )
}
```

### Size reference

| Size | Context |
|---|---|
| 72px | Splash screen |
| 48px | Section headers, onboarding |
| 32px | Lumi chat bubble avatar |
| 20px | Nav avatar (simplified — no vein detail) |

### Rules

- Always maintain 100:88 aspect ratio
- Never change the amber body line
- Never rotate or flip
- Never add shadows or gradients
- Lower wings always at 0.75 opacity
- Minimum size: 20px

---

## Brand Voice

Lumi speaks like a knowledgeable friend, not an algorithm.

- Literary and sensory — describes scent like a good writer describes light
- Concise — one precise sentence over three vague ones
- Never starts with affirmations ("Great!", "Certainly!", "I...")
- Frames layering advice as informed suggestion, never absolute fact

### Examples

> "Rain is coming. Vetiver knows how to stay."

> "The vetiver in Encre Noire gives Chloé's rose a shadow it doesn't have alone."

> "Thursday is yours. Rain is coming. Wear something that knows how to stay."

---

## App Icon

Lumi in a squircle. No wordmark inside the icon.

- **Primary:** `#FAF9F6` background — App Store submission
- **Dark alternate:** `#1C1A18` background — dark mode
- **Amber alternate:** `#B07D2A` background — campaign use only
- Apple HIG compliant: 10% safe zone on all edges, 80% canvas fill
