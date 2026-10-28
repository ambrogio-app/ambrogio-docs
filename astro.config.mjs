// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	// Published on GitHub Pages under the repository subpath.
	site: 'https://ambrogio-app.github.io',
	base: '/ambrogio-docs',
	// Relative links between pages resolve correctly only from URLs that end with a slash, as on
	// GitHub Pages; this makes the dev server refuse the others instead of serving them with broken links.
	trailingSlash: 'always',
	integrations: [
		// astro-mermaid must be registered before Starlight.
		mermaid({ autoTheme: true }),
		starlight({
			title: 'Ambrogio',
			logo: {
				light: './src/assets/logo-light.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: true,
			},
			description: 'Documentation for people who run Ambrogio, a self-hosted home assistant, in their own home.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/ambrogio-app/ambrogio-backend' },
			],
			// The sidebar follows the path of the person who installs Ambrogio (see AGENTS.md).
			sidebar: [
				{
					label: 'Introduction',
					items: ['explanation/what-is-ambrogio', 'reference/requirements'],
				},
				{
					label: 'Get started',
					items: ['tutorials/install-ambrogio'],
				},
				{
					label: 'Clients',
					items: ['how-to/install-terminal-client', 'how-to/install-satellite'],
				},
				{
					label: 'Agents and tools',
					items: [
						'how-to/add-agent',
						'how-to/choose-llm-provider',
						'how-to/connect-home-assistant',
						'how-to/connect-mcp-server',
						'how-to/search-past-conversations',
					],
				},
				{
					label: 'Voice',
					items: [
						'how-to/configure-voice',
						'how-to/change-wake-word',
						'how-to/choose-audio-devices',
					],
				},
				{
					label: 'Operate',
					items: [
						'how-to/reverse-proxy-https',
						'how-to/troubleshoot',
					],
				},
				{
					label: 'Concepts',
					items: [
						'explanation/architecture',
						'explanation/conversations',
						'explanation/agents',
						'explanation/voice',
						'explanation/security',
					],
				},
				{
					label: 'Reference',
					items: [
						{
							label: 'Configuration',
							items: [
								'reference/backend-configuration',
								'reference/agent-configuration',
								'reference/satellite-configuration',
								'reference/terminal-client',
								'reference/web-chat',
							],
						},
						{
							label: 'Diagnostics',
							items: [
								'reference/messages',
								'reference/logs',
								'reference/limits-and-timeouts',
							],
						},
						{
							label: 'Releases',
							items: ['reference/versions', 'reference/bundled-models'],
						},
					],
				},
			],
		}),
	],
});
