---
name: siteforge-html-template-adapter
description: Convert user-provided HTML/CSS/JS website files into reusable SiteForge personal portfolio templates. Use when Codex is given one or more HTML files as a visual/template reference and must autonomously extract that file's style, component structure, responsive behavior, media patterns, and dynamic effects, then implement a configurable SiteForge React template and matching static HTML export.
---

# SiteForge HTML Template Adapter

## Purpose

Use this skill to turn any provided HTML website into a SiteForge template. Do not assume Snowly or any fixed design. The source HTML for the current task is the design authority.

## Core Workflow

1. Inspect all provided HTML files and related assets before editing.
2. Identify the intended primary template when multiple HTML files exist. Prefer the file explicitly named by the user; otherwise choose the most complete page and note the choice.
3. Extract the source's design system:
   - color palette, typography, spacing, border radius, shadow depth, layout rhythm
   - nav/header, hero, content sections, cards, media blocks, forms, CTA, footer
   - animations, hover states, scroll reveal, carousel, sliders, calculators, lightboxes, lazy loading
   - desktop and mobile responsive behavior
4. Map hard-coded content to SiteForge data fields. Keep visual style from the HTML, but replace business-specific copy with `SiteData`.
5. Implement both preview and export paths:
   - React preview template under `frontend/src/templates`
   - static HTML export in `server/src/renderStaticHtml.ts`
   - shared typing/defaults in `shared/types.ts` when new configurable modules are needed
6. Ensure preview and exported HTML match in layout, content, style, and core interactions.

## Adaptation Rules

- Preserve the source HTML's visual personality. Recreate its composition, density, color contrast, button styles, cards, image treatments, footer style, and motion language.
- Replace hard-coded domain content with portfolio-friendly content from `SiteData`.
- Keep optional decorative or domain-specific widgets only when they can be adapted to user-editable SiteForge data. Remove or hide widgets that cannot be meaningfully configured.
- Make all media user-configurable. Images and videos must support URL input and uploaded file URLs when the app supports uploads.
- Every portfolio template must support project media: render `Project.coverImage` as the primary project image and render non-empty `Project.images[]` as a gallery adapted to the template style.
- Every portfolio template must support optional awards through `Award[]` when recognition content exists. Render award components only when `data.config.showAwards` is true and at least one award has a title; otherwise omit the entire awards section.
- Every portfolio template must support optional videos through `VideoItem[]` when the template has a reasonable place for media. Render video components only when `data.config.showVideos` is true and at least one video has a non-empty `videoUrl`; otherwise omit the entire video section.
- Add placeholders in forms, but do not auto-fill newly added user items with sample data.
- Respect `SiteConfig` controls such as `primaryColor`, `layout`, and section visibility. If a layout option is unsupported, degrade honestly and consistently in preview and export.
- Maintain responsive quality. No overlapping text, clipped controls, or page-level double scrollbars.
- Use lucide icons in React when suitable, but match the source HTML's icon style and sizing.

## Dynamic Effects

When the source HTML contains interactions, reimplement the useful ones without depending on CDN scripts:

- Use React state/effects for preview interactions.
- Use vanilla JavaScript embedded in exported HTML for the same interactions.
- Recreate scroll reveal/AOS-like effects with CSS transitions plus `IntersectionObserver`.
- Recreate hero carousels, image lightboxes, before/after sliders, tabs, accordions, and calculators when they remain relevant to SiteForge data.
- If an effect is purely domain-specific and not adaptable, replace it with an equivalent portfolio-friendly interaction rather than copying it blindly.

## SiteForge Data Mapping

Use these defaults unless the project defines a more specific schema:

- `User`: navigation brand, avatar, hero title/bio, about, contact, footer.
- `Project[]`: work cards, case studies, galleries, cover images, role/tools/date links.
- `Experience[]`: timeline or professional history sections.
- `Skill[]`: tags, cards, bars, capability lists.
- `Award[]`: awards, recognition, certificates.
- `VideoItem[]`: video showcases, demos, talks, media sections.
- `SocialLink[]`: nav/footer/social CTA links.
- `SiteConfig`: theme color, section visibility, hero images, layout, SEO, custom CSS.

## Validation Checklist

Run the strongest practical checks after implementation:

- `npm run typecheck`
- relevant tests, especially export/template tests
- `npm run build` when frontend or export behavior changes
- manual browser review for preview, export HTML, mobile width, media upload paths, and interactive effects

Export tests should assert that the generated HTML contains key sections, user/project data, expected CSS classes, and interaction scripts for the adapted template.

## Source HTML Handling

Use provided HTML files as input artifacts, not as immutable output. You may copy small structural ideas, but produce maintainable SiteForge code instead of embedding the original static page wholesale.

If multiple visual references conflict, prioritize the user's latest instruction and the HTML file they identify as the template source.
