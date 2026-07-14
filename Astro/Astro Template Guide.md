---
title: "Astro Template Guide"
---

# Astro Template Guide: Install, Backup, Restore & Customize

## Glossary

- **`create-astro`**: The official CLI scaffolding tool in `packages/create-astro` that bootstraps new Astro projects from templates. [1](#0-0) 
- **`@astrojs/cloudflare`**: The official Astro adapter for deploying to Cloudflare Workers. [2](#0-1) 
- **`astro.config.mjs`**: The central configuration file for your Astro project.
- **`wrangler.jsonc`**: Cloudflare's configuration file for Workers deployments.

---

## Part 1: Installing a Ready-Made Template

### Step 1 — Scaffold the project locally

Run the `create-astro` CLI and point it at a template. Built-in options are `basics`, `blog`, `starlight`, and `minimal`. You can also use any public GitHub repo as a template.

```bash
# Built-in blog template
npm create astro@latest my-site -- --template blog

# External GitHub repo as template
npm create astro@latest my-site -- --template username/repo-name
```

The `--template` flag is parsed by `create-astro` and the template files are downloaded via `downloadTemplate`. [3](#0-2) 

Available built-in templates at the time of writing:

| Value | Description |
|---|---|
| `basics` | Recommended starter |
| `blog` | Blog with MDX + sitemap |
| `starlight` | Documentation site |
| `minimal` | Empty project | [4](#0-3) 

### Step 2 — Install the Cloudflare adapter

```bash
cd my-site
npx astro add cloudflare
```

This installs `@astrojs/cloudflare` and updates `astro.config.mjs` automatically. Your config should look like:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  adapter: cloudflare(),
});
```

> **Note (Cloudflare Pages users):** As of adapter v13, the `@astrojs/cloudflare` adapter targets **Cloudflare Workers**, not Pages. If you are on Cloudflare Pages, follow the [migration guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/). [5](#0-4) 

> **Node.js version:** Cloudflare Pages defaults to Node 18.17.1, which is no longer supported. Override it to Node 22 in your Cloudflare dashboard. [6](#0-5) 

### Step 3 — Push to GitHub

```bash
git init          # already done if you used --git flag in create-astro
git add .
git commit -m "Initial commit from template"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### Step 4 — Connect to Cloudflare Workers

1. Log in to the [Cloudflare dashboard](https://dash.cloudflare.com).
2. Go to **Workers & Pages** → **Create** → **Connect to Git**.
3. Select your GitHub repository.
4. Set the build command to `npm run build` and the output directory to `dist`.
5. Cloudflare will automatically redeploy on every push to `main`.

> **Wrangler config:** If you have no custom bindings (KV, D1, etc.), you do not need a `wrangler.jsonc` — Astro generates a default one automatically. [7](#0-6) 

---

## Part 2: Backing Up a Template

Because your project lives in a GitHub repository, Git itself is your backup system.

### Option A — Tag a release (recommended)

```bash
# Before making changes, tag the current working state
git tag -a v1.0-template-backup -m "Backup: original template before customization"
git push origin v1.0-template-backup
```

Tags are permanent, lightweight snapshots stored in GitHub.

### Option B — Create a backup branch

```bash
git checkout -b backup/original-template
git push origin backup/original-template
git checkout main
```

### Option C — Export a ZIP

On GitHub, go to your repository → **Code** → **Download ZIP**. Store this in a secure location (cloud storage, etc.).

---

## Part 3: Restoring a Previous Template

### Restore from a tag

```bash
# See all tags
git tag

# Create a new branch from the backup tag to inspect it
git checkout -b restore-from-backup v1.0-template-backup

# Or hard-reset main to the tag (destructive — use with caution)
git checkout main
git reset --hard v1.0-template-backup
git push --force origin main
```

> **Best practice:** Never force-push to `main` without notifying collaborators. Prefer creating a restore branch and opening a PR.

### Restore a single file

```bash
# Restore one file from a tag without switching branches
git checkout v1.0-template-backup -- src/components/Header.astro
git commit -m "Restore Header.astro from backup"
```

---

## Part 4: Customizing the Template

### 4.1 — Modifying the Color Palette

Astro templates use **CSS custom properties** (variables) for theming. These are typically defined in a global stylesheet such as `src/styles/global.css`.

```css
/* src/styles/global.css */
:root {
  --color-primary: #5f11a6;
  --color-background: #ffffff;
  --color-text: #090b11;
  --color-accent: #c490f4;
}
```

To change the palette, edit these variables. Every component that references `var(--color-primary)` will update automatically.

For dark mode, add a `prefers-color-scheme` block:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #090b11;
    --color-text: #ffffff;
  }
}
```

This pattern mirrors how Astro's own internal components handle theming. [8](#0-7) 

### 4.2 — Adding or Removing Menu Options

Navigation is typically in `src/components/Header.astro` (or `Nav.astro`). Open that file and edit the links array:

```astro
---
// src/components/Header.astro
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  // Add a new item:
  { href: '/contact', label: 'Contact' },
];
---

<nav>
  <ul>
    {navLinks.map(link => (
      <li><a href={link.href}>{link.label}</a></li>
    ))}
  </ul>
</nav>
```

To **remove** a menu item, delete its entry from the array. To **add** one, append a new object. The new page must also exist under `src/pages/` for the link to resolve.

### 4.3 — Changing the Site Logo

**Replace the favicon/logo file:**

```bash
# Replace the SVG logo in the public directory
cp your-new-logo.svg public/favicon.svg
```

Then reference it in your layout (usually `src/layouts/Layout.astro` or `BaseHead.astro`):

```astro
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

For a logo image in the header:

```astro
---
// src/components/Header.astro
import logo from '../assets/logo.png';
import { Image } from 'astro:assets';
---

<header>
  <a href="/">
    <Image src={logo} alt="My Site Logo" width={120} height={40} />
  </a>
</header>
```

Using `astro:assets`'s `<Image>` component ensures automatic optimization.

### 4.4 — Changing Fonts

Fonts are configured in `astro.config.mjs` using the `fonts` API. The blog template already uses this pattern:

```js
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Inter',
      cssVariable: '--font-inter',
    },
  ],
});
```

Then in your layout, include the `<Font>` component and apply the variable:

```astro
---
import { Font } from 'astro:assets';
---
<head>
  <Font cssVariable="--font-inter" preload />
</head>
``` [9](#0-8) [10](#0-9) 

---

## Best Practices

| Practice | Why |
|---|---|
| Tag before every major change | Enables clean rollback without losing history |
| Test customizations locally with `npm run dev` | Catches errors before they reach Cloudflare |
| Use a `staging` branch for experiments | Cloudflare can deploy preview branches automatically |
| Keep `wrangler.jsonc` only if you use bindings | Astro auto-generates a default config otherwise |
| Use CSS variables for all colors | Makes palette swaps a single-file change |

### Citations

**File:** packages/create-astro/README.md (L1-5)
```markdown
# create-astro

## Scaffolding for Astro projects

**With NPM:**
```

**File:** packages/integrations/cloudflare/src/index.ts (L77-82)
```typescript
export interface Options
	extends Pick<
		PluginConfig,
		'auxiliaryWorkers' | 'configPath' | 'inspectorPort' | 'persistState' | 'remoteBindings'
	> {
	/** Options for handling images. */
```

**File:** packages/create-astro/src/actions/template.ts (L47-69)
```typescript
export async function template(
	ctx: Pick<Context, 'template' | 'prompt' | 'yes' | 'dryRun' | 'exit' | 'tasks'>,
) {
	if (!ctx.template && ctx.yes) ctx.template = 'basics';

	if (ctx.template) {
		await info('tmpl', `Using ${color.reset(ctx.template)}${color.dim(' as project template')}`);
	} else {
		const { template: tmpl } = await ctx.prompt({
			name: 'template',
			type: 'select',
			label: title('tmpl'),
			message: 'How would you like to start your new project?',
			initial: 'basics',
			choices: [
				{ value: 'basics', label: 'A basic, helpful starter project', hint: '(recommended)' },
				{ value: 'blog', label: 'Use blog template' },
				{ value: 'starlight', label: 'Use docs (Starlight) template' },
				{ value: 'minimal', label: 'Use minimal (empty) template' },
			],
		});
		ctx.template = tmpl;
	}
```

**File:** packages/integrations/cloudflare/CHANGELOG.md (L695-697)
```markdown
- [#15480](https://github.com/withastro/astro/pull/15480) [`e118214`](https://github.com/withastro/astro/commit/e118214eeaaa27384528c882af8b68e8daa61e2c) Thanks [@alexanderniebuhr](https://github.com/alexanderniebuhr)! - Drops official support for Cloudflare Pages in favor of Cloudflare Workers

  The Astro Cloudflare adapter now only supports deployment to Cloudflare Workers by default in order to comply with Cloudflare's recommendations for new projects. If you are currently deploying to Cloudflare Pages, consider [migrating to Workers by following the Cloudflare guide](https://developers.cloudflare.com/workers/static-assets/migration-guides/migrate-from-pages/) for an optimal experience and full feature support.
```

**File:** packages/integrations/cloudflare/CHANGELOG.md (L726-743)
```markdown
- [#15037](https://github.com/withastro/astro/pull/15037) [`8641805`](https://github.com/withastro/astro/commit/8641805289d2cd852458b023c83da54bf67cd579) Thanks [@matthewp](https://github.com/matthewp)! - The Wrangler configuration file is now optional. If you don't have custom Cloudflare bindings (KV, D1, Durable Objects, etc.), Astro will automatically generate a default configuration for you.

  ##### What should I do?

  If your `wrangler.jsonc` only contains basic configuration like this:

  ```jsonc
  {
    "main": "@astrojs/cloudflare/entrypoints/server",
    "compatibility_date": "2026-01-28",
    "assets": {
      "directory": "./dist",
      "binding": "ASSETS",
    },
  }
  ```

  You can safely delete the file. Astro will handle this configuration automatically.
```

**File:** packages/create-astro/CHANGELOG.md (L156-158)
```markdown
  Node.js 18 has now reached end-of-life and should not be used. For now, Astro will continue to support Node.js 18.20.8, which is the final LTS release of Node.js 18, as well as Node.js 20 and Node.js 22 or later. We will drop support for Node.js 18 in a future release, so we recommend upgrading to Node.js 22 as soon as possible. See Astro's [Node.js support policy](https://docs.astro.build/en/upgrade-astro/#support) for more details.

  :warning: **Important note for users of Cloudflare Pages**: The current build image for Cloudflare Pages uses Node.js 18.17.1 by default, which is no longer supported by Astro. If you are using Cloudflare Pages you should [override the default Node.js version](https://developers.cloudflare.com/pages/configuration/build-image/#override-default-versions) to Node.js 22. This does not affect users of Cloudflare Workers, which uses Node.js 22 by default.
```

**File:** packages/astro/src/core/errors/overlay.ts (L28-42)
```typescript
  /* Colors */
  --background: #ffffff;
  --error-text: #ba1212;
  --error-text-hover: #a10000;
  --success-text: #10b981;
  --title-text: #090b11;
  --box-background: #f3f4f7;
  --box-background-hover: #dadbde;
  --hint-text: #505d84;
  --hint-text-hover: #37446b;
  --border: #c3cadb;
  --accent: #5f11a6;
  --accent-hover: #792bc0;
  --stack-text: #3d4663;
  --misc-text: #6474a2;
```

**File:** examples/blog/astro.config.mjs (L1-35)
```javascript
// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
```

**File:** packages/astro/CHANGELOG.md (L2402-2416)
```markdown
  To enable this feature, configure `fonts` with one or more fonts:

  ```js title="astro.config.mjs"
  import { defineConfig, fontProviders } from 'astro/config';

  export default defineConfig({
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: 'Roboto',
        cssVariable: '--font-roboto',
      },
    ],
  });
  ```
```
