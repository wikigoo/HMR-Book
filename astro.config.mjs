// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightAutoSidebar from 'starlight-auto-sidebar';
import starlightSiteGraph from 'starlight-site-graph';

// https://astro.build/config
export default defineConfig({
	site: 'https://book.hmrbot.com',
	integrations: [
		starlight({
			title: 'HMR Book',
			plugins: [
				starlightAutoSidebar(),
				starlightSiteGraph(),
			],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/wikigoo/HMR-Book' }],
			sidebar: [
				{ label: 'Astro', collapsed: true, items: [{ autogenerate: { directory: 'astro' } }] },
				{ label: 'Checklist', collapsed: true, items: [{ autogenerate: { directory: 'Checklist' } }] },
				{ label: 'Cloudflared', collapsed: true, items: [{ autogenerate: { directory: 'cloudflared' } }] },
				{ label: 'FlowiseAI', collapsed: true, items: [{ autogenerate: { directory: 'flowiseai' } }] },
				{ label: 'Flutter', collapsed: true, items: [{ autogenerate: { directory: 'flutter' } }] },
				{ label: 'Marketing', collapsed: true, items: [{ autogenerate: { directory: 'Marketing' } }] },
				{ label: 'Other', collapsed: true, items: [{ autogenerate: { directory: 'Other' } }] },
				{ label: 'Script', collapsed: true, items: [{ autogenerate: { directory: 'Script' } }] },
				{ label: 'UI', collapsed: true, items: [{ autogenerate: { directory: 'UI' } }] },
			],
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
