# The Garden Unit — Design System (Master)

> Authored directly from design reasoning and the current live app (Next.js + Tailwind, mobile-first booking platform). The `ui-ux-pro-max` skill's search database/scripts were not present in this environment, so this is **not** a database match — it's a considered brand system built for this specific product: a local, youth-run (12+, adult-supervised) garden and property service in the UK. Two anchor colours were pulled directly from weweed.co.uk's shipped CSS (`--primary-color`, `--logo-name-color`), then built out into full scales — see §2.

## 1. Brand Positioning

**Personality:** Trustworthy · Fresh/natural · Approachable · Reliable & professional

**Statement:** *The Garden Unit is your neighbourhood's trusted garden and property care service — professional results, delivered by a motivated local team, with every job overseen for quality and safety.*

The brand has to do two things at once that pull in different directions: read as **credible enough that a stranger hands over their address and card details**, while staying **warm and local, not corporate**. Resolve this with a muted sage green (trust, growth, foliage) as the dominant colour, and a dusty rose accent used sparingly — the pairing reads as an actual English garden (roses among sage/lavender foliage) rather than a generic "green = eco" cliché.

## 2. Colour System

Two custom scales replace the current default-blue `brand` token in `tailwind.config.js`, plus a warm neutral to replace cool Tailwind gray. The `brand-500` and `accent-500` anchors below are pulled directly from **weweed.co.uk**'s production CSS (`--logo-name-color: #7e974a` / `--secondary-hover: #779552` and `--primary-color: #c26994` / `--primary-hover: #a04d7a`), with the rest of each scale built out around them.

### Primary — Garden Sage (`brand`)
Primary actions, links, nav, focus states — the "trust" colour.

| Token | Hex | Usage |
|---|---|---|
| brand-50 | `#F6F8F0` | subtle backgrounds, success banners |
| brand-100 | `#E9EFDC` | hover backgrounds |
| brand-200 | `#D3E0BA` | borders on light surfaces |
| brand-300 | `#B7CE90` | disabled/muted accents |
| brand-400 | `#9BBA68` | icons, secondary emphasis |
| **brand-500** | **`#7E974A`** | **sourced from weweed.co.uk `--logo-name-color`** — mid-tone, illustration use |
| **brand-600** | **`#647A3B`** | **primary buttons, links, active nav** (≈4.8:1 white text — passes AA) |
| brand-700 | `#4F6130` | hover/pressed state on buttons |
| brand-800 | `#3F4D27` | headings on light bg where extra weight needed |
| brand-900 | `#333F20` | rarely used, max-contrast text |

### Accent — Dusty Rose (`accent`)
Used *sparingly*: badges, highlights, secondary CTA, illustration warmth. Never the dominant colour on a screen.

| Token | Hex | Usage |
|---|---|---|
| accent-50 | `#FBF2F6` | badge backgrounds |
| accent-100 | `#F5DCE7` | |
| accent-300 | `#DC90B4` | |
| **accent-500** | **`#C26994`** | **sourced from weweed.co.uk `--primary-color`** — badges, secondary highlight |
| **accent-600** | **`#A04D7A`** | **sourced from weweed.co.uk `--primary-hover`** — text on accent-50 bg, pressed state |
| accent-700 | `#833D63` | |

### Neutral — Warm Stone (`stone`)
Replaces cool `gray-*` for backgrounds/borders/body text — pairs better with sage + dusty rose than blue-leaning grays do.

| Token | Hex |
|---|---|
| stone-50 | `#FAF9F7` |
| stone-100 | `#F2F0EC` |
| stone-200 | `#E4E0D8` |
| stone-300 | `#CFC9BC` |
| stone-500 | `#7D7568` |
| stone-700 | `#443F38` |
| stone-900 | `#1C1916` |

### Semantic (unchanged, standard Tailwind — no need to reinvent)
- Success: `brand-600` (green already *is* the success colour — don't add a second green)
- Warning: `amber-500` `#F59E0B`
- Error: `red-600` `#DC2626`
- Star ratings: keep `yellow-400` — universal convention, don't rebrand it

**Anti-pattern:** don't let dusty rose become the primary CTA colour — it's a highlight, not the trust colour. Don't mix warm `stone` and cool `gray` on the same screen once adopted; pick one.

## 3. Typography

Mobile-first, and the app displays a lot of currency (`£12.50`) and short labels, so legibility at small sizes and clean numeral rendering matter more than editorial personality.

- **Headings/Display:** **Outfit** (600/700) — geometric, rounded, friendly-but-professional; reads well at large sizes for page titles and service names.
- **Body/UI:** **Inter** (400/500/600) — excellent at 14–16px, well-hinted tabular numerals (good for prices), the de facto standard for product UI so it won't feel like a "designed" font fighting the interface.

Both are free on Google Fonts, self-hostable via `next/font`.

*Note: weweed.co.uk pairs a grotesk sans (Onest) with a bold serif (Recoleta) for headline personality. Recoleta isn't free/open, so it's not adopted here, but if more editorial character is wanted later, a free equivalent like **Fraunces** (warm, slightly organic serif) paired with Inter would land in the same spirit without the licensing cost.*

### Type scale (base 16px, mobile-first)
| Token | Size / Line-height | Use |
|---|---|---|
| xs | 12px / 16px | micro labels, badges |
| sm | 14px / 20px | captions, secondary text, "From" prefix |
| base | 16px / 24px | body copy |
| lg | 18px / 28px | lead paragraphs |
| xl | 20px / 28px | service card titles |
| 2xl | 24px / 32px | section headings |
| 3xl | 30px / 36px | page titles ("Current Tasks", "Admin Dashboard") |
| 4xl | 36px / 40px | landing hero title |

## 4. Spacing, Radius, Elevation

- **Spacing scale:** Tailwind default (4/8/12/16/24/32/48/64px) — already what the app uses, keep it.
- **Radius:** `rounded-lg` (8px) for cards, inputs, and primary buttons; `rounded-full` for pills/badges/avatars **and secondary/cancel buttons** (see below). Don't introduce a third radius value.
- **Elevation:** `shadow-sm` at rest → `shadow-lg` on hover for interactive cards (already implemented on `ServiceCard`); sticky nav stays `shadow-sm`. Two elevation steps is enough for this product — don't add more.

### Button hierarchy
- **Primary** (submit, confirm, main CTA): `bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold`
- **Affirmative/confirm-in-context** (Save/Confirm/Mark Done sitting next to a primary Edit button in the same row — admin panels): `bg-brand-700 hover:bg-brand-800`, same `rounded-lg` shape as primary
- **Secondary** (Cancel, Back, and other de-emphasized paired actions): pill-shaped dusty rose — `bg-accent-600 hover:bg-accent-700 text-white rounded-full font-bold`. This is a deliberate second silhouette (pill vs. rounded-rectangle) so secondary actions read as visually distinct from primary ones at a glance, not just a different colour.
- **Destructive** (Remove/Delete): `bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold` — unchanged, standard semantic red.

## 5. Iconography

Current UI uses a couple of raw emoji (📋 📝) as icons. Recommend a real outline icon set — **Lucide** (open-source, pairs naturally with Tailwind, tree-shakeable) — for anything beyond decorative flourishes, so the product reads as considered rather than prototyped. Stroke width 1.5–2px, consistent size (20–24px in UI, 16px inline with text).

## 6. Motion

- Standard tier only: **150–250ms ease-out** on hover/tap/focus (buttons, cards, the hamburger menu icon already does this).
- No page-transition or scroll-triggered animation — this is a utilitarian booking flow, not a marketing site; motion here should confirm an action happened, not decorate.

## 7. Logo / Mark Concept

- **Wordmark:** "The Garden Unit" set in Outfit Bold, `brand-700`.
- **Icon mark** (favicon / app icon): a simple monoline leaf or spade silhouette in a rounded square — `brand-50` mark on `brand-600` fill for the app icon; `brand-600` mark on transparent/white for inline use.

## 7b. Key-Page Hero Imagery

Full-bleed photographic background on the landing, About, Login, and Register screens — same technique as a reference bike-brand site: a moody, desaturated/misty photo fills the viewport, a sharp full-colour foreground element (the white content card, or the wordmark) sits on top, with a light `stone-50` wash (opacity 50–70%, heavier on About/landing where more body text sits directly on the photo, lighter on Login/Register where a white card carries the contrast) between the two so nothing overlaid on bare photo drops below AA contrast.

- Source image: `public/garden-mist-bg.png` — a misty English garden (hedges, gravel path, stone archway), generated to match the reference's grey-green fog and empty-space-for-a-mark composition.
- Implementation: `next/image` with `fill` + `object-cover`, not a raw CSS `background-image` — gets automatic resizing/WebP-AVIF/responsive serving from Vercel's image pipeline rather than shipping the full source file to every device.
- Decorative only: `alt=""`, doesn't compete with the real content for screen-reader attention.
- Deliberately **not** applied to logged-in dashboard/data screens (Browse Services, Current Tasks, Admin, etc.) — those are utilitarian and dense; a photo background there would fight the content rather than frame it.

## 8. Applied Status

**Live as of this revision** — every component has been swept from default Tailwind `blue-*`/`green-*`/`gray-*` to this system:

- `blue-600` → `brand-600` (primary buttons, links, active nav state, focus rings)
- `green-600` (confirm/success buttons) → `brand-600` for neutral primary actions, `brand-700` for affirmative/confirm actions that sit next to a primary action in the same row (e.g. admin "Edit" vs "Confirm"/"Save"), so the two remain visually distinguishable within one colour family instead of two
- `gray-*` → `stone-*` (backgrounds, borders, body text)
- `accent-500`/`accent-700` dusty rose applied to the service category badge (Garden/Other Services) and the "Custom Quote" label
- Fonts wired via `next/font`: Outfit on `h1`–`h3`, Inter on body (see `app/layout.jsx`, `app/globals.css`)
- Spacing opened up across the board: page containers `py-8` → `py-10`/`py-12`, cards `p-4` → `p-5`/`p-6`, card grids `gap-4` → `gap-6`, form field spacing `space-y-4` → `space-y-5`

Untouched by design: error/destructive red, warning amber, and star-rating yellow — all standard Tailwind, per §2.

## 9. Anti-Patterns (don't do these)

- Emoji as primary icons in shipped UI
- A third brand colour beyond sage + dusty rose
- Mixing warm `stone` and cool `gray` once this is adopted
- Decorative animation with no functional purpose
- Dusty rose as a primary button colour (it's a highlight, not the trust colour)
