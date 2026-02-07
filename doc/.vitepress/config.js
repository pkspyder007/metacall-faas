/** @type {import('vitepress').UserConfig} */
const config = {
	title: 'MetaCall FaaS',
	ignoreDeadLinks: true,
	description: 'Local FaaS platform for polyglot applications',
	base: '/',
	themeConfig: {
		nav: [
			{ text: 'Overview', link: '/overview' },
			{ text: 'API Routes', link: '/api-routes' }
		],
		sidebar: [
			{ text: 'Overview', link: '/overview' },
			{ text: 'Requirements', link: '/requirements' },
			{ text: 'How to Run', link: '/how-to-run' },
			{ text: 'Architecture in Detail', link: '/architecture' },
			{ text: 'API Routes', link: '/api-routes' },
			{ text: 'Data Flow', link: '/data-flow' },
			{ text: 'IPC and MetaCall Process', link: '/ipc-and-metacall' },
			{ text: 'metacall-deploy Usage', link: '/metacall-deploy-usage' }
		],
		socialLinks: [
			{ icon: 'github', link: 'https://github.com/metacall/faas' }
		],
		footer: {
			message: 'Released under the Apache-2.0 License.',
			copyright: 'Copyright © 2016 - 2024 MetaCall'
		}
	},
	markdown: {
		theme: { light: 'github-light', dark: 'github-dark' }
	}
};

export default async () => {
	const { withMermaid } = await import('vitepress-plugin-mermaid');
	return withMermaid(config);
};
