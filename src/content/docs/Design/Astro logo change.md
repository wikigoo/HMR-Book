---
title: "Astro logo change"
---

The files necessary to replace the old logo, based on the new logo (`hmr-icon-mark.svg`/ Brand Gradient). All their paths`assets/`It is:

**۱. hmr-icon-mark.svg**Format: SVG (vector, transparent background) — Size: 1024×1024 viewBox — Usage: Raw icon for use anywhere else in the system (cards, site header, etc.).*(Already made, keep it that way)*

**۲. hmr-icon-appicon.svg**Format: SVG (vector, navy background \+ neon throat) — Size: 1024×1024 viewBox — Usage: Main source for exporting all PNGs below (App icon / favicon).

**۳. favicon.png**Format: PNG — Size: 48×48px (or 32×32 if the browser prefers) — Usage: Browser/tab favicon.

**۴. hmr-icon-48.png**Format: PNG — Size: 48×48px — Usage: Small icon inside UI (sidebar, notifications).

**۵. hmr-icon-192.png**Format: PNG — Size: 192×192px — Usage: PWA manifest icon (Android home screen).

**۶. hmr-icon-512.png**Format: PNG — Size: 512×512px — Usage: PWA manifest icon (splash / largest size).

**۷. hmr-icon-1x.png / hmr-icon-2x.png / hmr-icon-3x.png**Format: PNG — Sizes: 60×60 / 120×120 / 180×180px — Usage: iOS app icon (retina densities).

**۸. hmr-logo.svg**Format: SVG — Size: 333×333 viewBox (or any square ratio) — Usage: Standalone logo for Brand/Logo card in design system (`cards/brand-logo.html`).

**۹. hmr-logo-source.png**Format: PNG (transparent or navy background, high quality) — Recommended size: 512×512px or larger — Use: High-quality reference/archive file for future exports.

**۱۰. hmr-mark-240.png**Format: PNG — Size: 240×240px — Usage: Medium size preview (e.g. avatar/profile card).

**۱۱. hmr-lockup.svg**Format: SVG — Size: \~320px width (height proportional) — Usage: Logo \+ name (lockup) together for site/document header.

Note: All should be exported from a single vector source (cyan→blue→indigo gradient, not the old color) so that all sizes remain consistent. If you want, I can make these PNGs myself from`hmr-icon-appicon.svg`I will make it and directly in`assets/`I'll put it this way — no need to manually generate.  
