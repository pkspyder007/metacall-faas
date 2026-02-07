#!/usr/bin/env node

import colors from 'colors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { initializeAPI } from './api';
import { getConfig } from './config';
import { InMemoryApplicationRegistry } from './registry/in-memory-registry';
import { autoDeployApps } from './utils/autoDeploy';
import { ensureFolderExists } from './utils/filesystem';
import { InvokeQueue } from './utils/invoke';
import { printVersionAndExit } from './utils/version';

// Initialize the FaaS
void (async (): Promise<void> => {
	try {
		const args = process.argv.slice(2);
		if (args.includes('--version')) {
			printVersionAndExit();
		}

		dotenv.config();
		colors.enable();

		const appsDirectory = getConfig().appsDirectory;

		await ensureFolderExists(appsDirectory);

		// Clear all deployments
		if (args.includes('--prune')) {
			// Delete appsDirectory files
			for (const file of await fs.readdir(appsDirectory)) {
				await fs.rm(path.join(appsDirectory, file), {
					recursive: true,
					force: true
				});
			}
		}

		const registry = new InMemoryApplicationRegistry();
		const invokeQueue = new InvokeQueue();

		await autoDeployApps(appsDirectory, registry, invokeQueue);

		const app = initializeAPI({ registry, invokeQueue });
		const port = getConfig().port;

		app.listen(port, () => {
			console.log(`Server is running on the port ${port}`);
		});
	} catch (e) {
		console.error('Error while initializing: ', e);
	}
})();
