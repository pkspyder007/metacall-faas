import { ensureFolderExists, pruneDirectory } from '@/helpers/fs';
import colors from 'colors';
import dotenv from 'dotenv';
import { initializeAPI } from './api';
import { getConfig } from './config';
import { InMemoryApplicationRegistry } from './registry/in-memory-registry';
import { autoDeployApps } from './utils/autoDeploy';
import { InvokeQueue } from './utils/invoke';
import { printVersionAndExit } from './utils/version';

export async function run(): Promise<void> {
	const args = process.argv.slice(2);
	if (args.includes('--version')) {
		printVersionAndExit();
	}

	dotenv.config();
	colors.enable();

	const config = getConfig();
	const appsDirectory = config.appsDirectory;

	await ensureFolderExists(appsDirectory);

	if (args.includes('--prune')) {
		await pruneDirectory(appsDirectory);
	}

	const registry = new InMemoryApplicationRegistry();
	const invokeQueue = new InvokeQueue();

	await autoDeployApps(appsDirectory, registry, invokeQueue);

	const app = initializeAPI({ registry, invokeQueue });

	app.listen(config.port, () => {
		console.log(`Server is running on the port ${config.port}`);
	});
}
