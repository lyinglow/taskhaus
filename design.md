# Design notes

Running notes on UI conventions for this app, so changes stay consistent instead of
re-litigating the same decisions component by component.

## Button sizing

- **Card CTAs where the whole card is already clickable** (e.g. `ServiceCard`): keep the
  button small and content-width (`px-6 py-2`, no `w-full`) on every breakpoint, including
  mobile. The button is a visual affordance, not the only way to trigger the action - making
  it full-width makes it look like the primary/only interactive element and overpowers the
  card. `sm:px-8` for a touch more breathing room on wider screens is fine.
- **Primary actions in a feature area** (job management, service management, book/cancel/review,
  profile, feedback, partners, crew portal): full-width on mobile for easy tapping
  (`w-full`), auto-width on desktop so they don't stretch across a wide desktop layout
  (`sm:w-auto sm:px-8`, or `sm:px-6` for smaller list-row buttons). Paired buttons (Save/Cancel,
  Confirm/Cancel) use `flex-1 sm:flex-none sm:px-6` on each so they split evenly on mobile and
  shrink to content-width side by side on desktop.
- **Narrow auth-style cards** (Login, Register, Forgot/Reset password, Team login): keep the
  submit button full-width on every breakpoint. These cards are already narrow
  (`max-w-md`), so a full-width button doesn't look oversized the way it does in a wide
  desktop layout - this matches standard convention for that layout (Stripe, Notion, etc.).
- **Paired/adjacent buttons must be wrapped in a flex container with a `gap`.** Two
  conditionally-rendered sibling buttons with no wrapper will render glued together with
  zero gap on wider viewports - React/JSX strips whitespace-only text between adjacent
  expressions, so the buttons lose the natural inline spacing they'd otherwise get.

## Text casing

Sentence case everywhere in the UI (headings, buttons, labels, nav links) - only the first
word and proper nouns are capitalized. The one fixed exception is the app name, "The Garden
Unit", which stays capitalized wherever it appears. CSV/spreadsheet export column headers are
the other exception, kept as Title Case per standard spreadsheet convention since that's
exported file content, not in-app UI text.
