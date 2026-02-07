#!/usr/bin/env node

import { run } from './bootstrap';

void (async (): Promise<void> => {
	try {
		await run();
	} catch (e) {
		console.error('Error while initializing: ', e);
	}
})();
