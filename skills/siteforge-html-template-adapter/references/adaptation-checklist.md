# HTML To SiteForge Template Checklist

Use this file when implementing or reviewing a template adaptation.

## Before Editing

- Read the user-named HTML file first.
- If no file is named, inspect all candidate HTML files and choose the most complete reference.
- List the visual system: palette, typography, radius, shadows, spacing, motion, responsive breakpoints.
- List components: nav, hero, about, work, media, awards, skills, experience, contact, footer.
- List interactions: carousel, reveal, hover, slider, modal, estimator, form behavior.

## Implementation

- Keep preview and export rendering in sync.
- Replace fixed copy with `SiteData`.
- Keep new user-created items empty; use placeholders for examples.
- Filter empty image/video URLs before rendering galleries or media lists.
- Preserve source-inspired animation timing and easing where possible.
- Avoid CDN dependencies in React and exported HTML.

## Acceptance

- Preview looks like the source style, not a generic dashboard.
- Exported HTML opens as a single file and matches preview.
- `layout=list` and `layout=grid` behave consistently in preview and export.
- Mobile width has no incoherent overlaps or page-level double scrollbars.
- Missing optional arrays do not crash or leave awkward blank sections.
