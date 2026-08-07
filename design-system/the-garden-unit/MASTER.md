# The Garden Unit — Design System (Master)

> Authored directly from design reasoning and the current live app (Next.js + Tailwind, mobile-first booking platform). The `ui-ux-pro-max` skill's search database/scripts were not present in this environment, so this is **not** a database match — it's a considered brand system built for this specific product: a local, youth-run (12+, adult-supervised) garden and property service in the UK.

## 1. Brand Positioning

**Personality:** Trustworthy · Fresh/natural · Approachable · Reliable & professional

**Statement:** *The Garden Unit is your neighbourhood's trusted garden and property care service — professional results, delivered by a motivated local team, with every job overseen for quality and safety.*

The brand has to do two things at once that pull in different directions: read as **credible enough that a stranger hands over their address and card details**, while staying **warm and local, not corporate**. Resolve this with a confident green (trust, growth, "professional garden company") as the dominant colour, and a small warm accent (soil/terracotta) used sparingly to keep it human rather than sterile-SaaS.

## 2. Colour System

Two custom scales replace the current default-blue `brand` token in `tailwind.config.js`, plus a warm neutral to replace cool Tailwind gray.

### Primary — Garden Green (`brand`)
Primary actions, links, nav, focus states — the "trust" colour.

| Token | Hex | Usage |
|---|---|---|
| brand-50 | `#F0FAF4` | subtle backgrounds, success banners |
| brand-100 | `#DAF2E3` | hover backgrounds |
| brand-200 | `#B3E5C7` | borders on light surfaces |
| brand-300 | `#82D3A4` | disabled/muted accents |
| brand-400 | `#4FB87D` | icons, secondary emphasis |
| brand-500 | `#2E9960` | mid-tone, chart/illustration use |
| **brand-600** | **`#1F7A4D`** | **primary buttons, links, active nav** (≈4.7:1 white text — passes AA) |
| brand-700 | `#185F3D` | hover/pressed state on buttons |
| brand-800 | `#14492F` | headings on light bg where extra weight needed |
| brand-900 | `#103A26` | rarely used, max-contrast text |

### Accent — Terracotta (`accent`)
Used *sparingly*: badges, highlights, secondary CTA, illustration warmth. Never the dominant colour on a screen.

| Token | Hex | Usage |
|---|---|---|
| accent-50 | `#FDF4EC` | badge backgrounds |
| accent-100 | `#FAE3CC` | |
| accent-300 | `#EBA35A` | |
| **accent-500** | **`#D9761F`** | **badges, secondary highlight, "Other Services" tag alt** |
| accent-600 | `#B85F16` | text on accent-50 bg |
| accent-700 | `#8F4912` | |

### Neutral — Warm Stone (`stone`)
Replaces cool `gray-*` for backgrounds/borders/body text — pairs better with green + terracotta than blue-leaning grays do.

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

**Anti-pattern:** don't let terracotta become the primary CTA colour — it's a highlight, not the trust colour. Don't mix warm `stone` and cool `gray` on the same screen once adopted; pick one.

## 3. Typography

Mobile-first, and the app displays a lot of currency (`£12.50`) and short labels, so legibility at small sizes and clean numeral rendering matter more than editorial personality.

- **Headings/Display:** **Outfit** (600/700) — geometric, rounded, friendly-but-professional; reads well at large sizes for page titles and service names.
- **Body/UI:** **Inter** (400/500/600) — excellent at 14–16px, well-hinted tabular numerals (good for prices), the de facto standard for product UI so it won't feel like a "designed" font fighting the interface.

Both are free on Google Fonts, self-hostable via `next/font`.

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
- **Radius:** `rounded-lg` (8px) for cards, inputs, buttons; `rounded-full` for pills/badges/avatars. Don't introduce a third radius value.
- **Elevation:** `shadow-sm` at rest → `shadow-lg` on hover for interactive cards (already implemented on `ServiceCard`); sticky nav stays `shadow-sm`. Two elevation steps is enough for this product — don't add more.

## 5. Iconography

Current UI uses a couple of raw emoji (📋 📝) as icons. Recommend a real outline icon set — **Lucide** (open-source, pairs naturally with Tailwind, tree-shakeable) — for anything beyond decorative flourishes, so the product reads as considered rather than prototyped. Stroke width 1.5–2px, consistent size (20–24px in UI, 16px inline with text).

## 6. Motion

- Standard tier only: **150–250ms ease-out** on hover/tap/focus (buttons, cards, the hamburger menu icon already does this).
- No page-transition or scroll-triggered animation — this is a utilitarian booking flow, not a marketing site; motion here should confirm an action happened, not decorate.

## 7. Logo / Mark Concept

- **Wordmark:** "The Garden Unit" set in Outfit Bold, `brand-700`.
- **Icon mark** (favicon / app icon): a simple monoline leaf or spade silhouette in a rounded square — `brand-50` mark on `brand-600` fill for the app icon; `brand-600` mark on transparent/white for inline use.

## 8. What Changes vs. Today

The live app currently uses default Tailwind `blue-600` for primary buttons/links/nav and `green-600` for confirm actions, with cool `gray-*` neutrals throughout. Adopting this system means:

- `blue-600` → `brand-600` (primary buttons, links, active nav state, focus rings)
- existing `green-600` (confirm/success buttons) → also `brand-600` (they become the same colour family, which is intentional — currently blue-for-primary and green-for-success sit oddly close together)
- `gray-*` → `stone-*` (backgrounds, borders, body text)
- new: `accent-500` terracotta introduced for badges/highlights (e.g. the "Garden Services" / "Other Services" category pills, star-review counts)

**This has not been applied to the live components yet** — this file is the source of truth to build from. Say the word and I'll re-skin the app to match (swap the Tailwind config, then sweep `blue-600`/`gray-*` usages across components).

## 9. Anti-Patterns (don't do these)

- Emoji as primary icons in shipped UI
- A third brand colour beyond green + terracotta
- Mixing warm `stone` and cool `gray` once this is adopted
- Decorative animation with no functional purpose
- Terracotta as a primary button colour (it's a highlight, not the trust colour)
