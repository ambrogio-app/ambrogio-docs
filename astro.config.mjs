// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';


// https://astro.build/config
export default defineConfig({
	// Published on GitHub Pages under the repository subpath.
	site: 'https://ambrogio-app.github.io',
	base: '/ambrogio-docs',
	integrations: [
		// astro-mermaid must be registered before Starlight.
		mermaid({ autoTheme: true }),
		starlight({
			title: 'Ambrogio',
			description: 'Documentation for people who run Ambrogio, a self-hosted home assistant, in their own home.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/ambrogio-app/ambrogio-backend' },
			],
			sidebar: [
				{
					label: 'Tutorials',
					items: [
						{ slug: 'tutorials/first-conversation' },
						{ slug: 'tutorials/talk-out-loud' },
					],
				},
				{
					label: 'How-to guides',
					items: [
						{
							label: 'Install',
							items: [
								{ slug: 'how-to/run-backend-docker' },
								{ slug: 'how-to/run-backend-from-source' },
								{ slug: 'how-to/install-terminal-client' },
								{ slug: 'how-to/install-web-chat' },
								{ slug: 'how-to/install-satellite' },
							],
						},
						{
							label: 'Agents and connectors',
							items: [
								{ slug: 'how-to/add-agent' },
								{ slug: 'how-to/connect-home-assistant' },
								{ slug: 'how-to/connect-mcp-server' },
							],
						},
						{
							label: 'Voice',
							items: [
								{ slug: 'how-to/enable-voice' },
								{ slug: 'how-to/change-voice' },
								{ slug: 'how-to/choose-audio-devices' },
								{ slug: 'how-to/change-wake-word' },
							],
						},
						{
							label: 'Operate',
							items: [
								{ slug: 'how-to/reverse-proxy-https' },
								{ slug: 'how-to/back-up-and-upgrade' },
								{ slug: 'how-to/troubleshoot' },
							],
						},
					],
				},
				{
					label: 'Reference',
					items: [
						{ slug: 'reference/backend-configuration' },
						{ slug: 'reference/agent-configuration' },
						{ slug: 'reference/satellite-configuration' },
						{ slug: 'reference/terminal-client' },
						{ slug: 'reference/web-chat' },
						{ slug: 'reference/http-api' },
						{ slug: 'reference/conversation-protocol' },
						{ slug: 'reference/messages' },
						{ slug: 'reference/limits-and-timeouts' },
						{ slug: 'reference/logs' },
						{ slug: 'reference/versions' },
						{ slug: 'reference/bundled-models' },
					],
				},
				{
					label: 'Explanation',
					items: [
						{ slug: 'explanation/architecture' },
						{ slug: 'explanation/turns' },
						{ slug: 'explanation/agents' },
						{ slug: 'explanation/voice' },
						{ slug: 'explanation/security' },
					],
				},
			],
		}),
	],
});
