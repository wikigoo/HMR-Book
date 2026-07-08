// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightAutoSidebar from 'starlight-auto-sidebar';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'HMR Book',
				plugins: [starlightAutoSidebar()],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'Astro', items: [{ autogenerate: { directory: 'astro' } }] },
				{ label: 'Checklist', items: [{ autogenerate: { directory: 'Checklist' } }] },
				{ label: 'Cloudflared', items: [{ autogenerate: { directory: 'cloudflared' } }] },
				{ label: 'FlowiseAI', items: [{ autogenerate: { directory: 'flowiseai' } }] },
				{ label: 'Flutter', items: [{ autogenerate: { directory: 'flutter' } }] },
				{ label: 'Marketing', items: [{ autogenerate: { directory: 'Marketing' } }] },
				{ label: 'Other', items: [{ autogenerate: { directory: 'Other' } }] },
				{ label: 'Script', items: [{ autogenerate: { directory: 'Script' } }] },
				{ label: 'UI', items: [{ autogenerate: { directory: 'UI' } }] },
			],
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
