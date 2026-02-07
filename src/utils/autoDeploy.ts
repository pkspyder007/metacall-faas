import { readEnvFile } from '@/helpers/env';
import { ApplicationRegistry } from '@/registry/registry';
import { Dirent } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Application, Resource } from '../app';
import { deployProcess } from './deploy';
import { InvokeQueue } from './invoke';

export const autoDeployApps = async (
	appsDir: string,
	registry: ApplicationRegistry,
	invokeQueue: InvokeQueue
): Promise<void> => {
	const directories = (
		await fs.readdir(appsDir, {
			withFileTypes: true
		})
	).reduce(
		(dirs: Dirent[], current: Dirent) =>
			current.isDirectory() ? [...dirs, current] : dirs,
		[]
	);

	const resources: Resource[] = directories.map(dir => ({
		id: dir.name,
		path: path.join(appsDir, dir.name),
		jsons: [],
		runners: []
	}));

	let succeeded = 0;
	for (const resource of resources) {
		registry.set(resource.id, new Application());
		const application = registry.get(resource.id);
		if (!application) {
			throw new Error(`Application not found: ${resource.id}`);
		}
		application.resource = Promise.resolve(resource);

		const envFilePath = path.join(resource.path, `.env`);
		const env = await readEnvFile(envFilePath);

		try {
			await deployProcess(resource, env, registry, invokeQueue);
			succeeded++;
		} catch (err) {
			registry.delete(resource.id);
			// eslint-disable-next-line no-console
			console.warn(
				`Failed to load app "${resource.id}":`,
				err instanceof Error ? err.message : String(err)
			);
		}
	}

	if (succeeded > 0) {
		console.log(
			'Previously deployed applications deployed successfully'.green
		);
	}
};
