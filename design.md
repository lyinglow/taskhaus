# Design notes

Running notes on UI conventions for this app, so changes stay consistent instead of
re-litigating the same decisions component by component.

## Button sizing

- **Buttons that appear once per row/card in a repeated list** (Select on a service card,
  I'm interested on an idea, Leave a review / Book again on a job card, Edit / Save / Cancel /
  Remove / Confirm / Mark done / Approve & complete / Job ready for review on job/crew/service
  list items): always compact, content-width (`px-6 py-2`, no `w-full`, no `flex-1`), on every
  breakpoint including mobile. These are one of several repeated actions in a scrolling list,
  not the single focus of the screen - full-width makes each one look like the primary/only
  interactive element and gets visually heavy once several stack up. `sm:px-8` for a touch
  more breathing room on wider screens is fine; paired buttons (Save/Cancel, Edit/Remove) sit
  in a plain `flex gap-2` row with no `flex-1`/`flex-none`, left-aligned rather than splitting
  the row evenly.
- **The single primary action on a dedicated page** (Submit request on the booking page, Save
  changes / Edit profile on the profile page, Add service / Add team member / Add idea on their
  forms, Send feedback, Get in touch, Cancel request / Leave a review on a job's own detail
  page, Submit review): full-width on mobile for easy tapping (`w-full`), auto-width on desktop
  so it doesn't stretch across a wide layout (`sm:w-auto sm:px-8`). Paired buttons here
  (Cancel/Submit, Save/Cancel) use `flex-1 sm:flex-none sm:px-6` on each so they split evenly on
  mobile and shrink to content-width side by side on desktop. The distinction from the rule
  above is focus: this is the one thing this whole screen is for, not one of many repeated
  items.
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
