import { ApplicationRegistry } from '@/registry/registry';
import { Dirent } from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Application, Resource } from '../app';
import { deployProcess } from './deploy';

const isErrnoException = (err: unknown): err is NodeJS.ErrnoException =>
	err instanceof Error && 'code' in err;

const readEnvFile = async (
	envFilePath: string
): Promise<Record<string, string>> => {
	try {
		const envFileContent = await fs.readFile(envFilePath, 'utf-8');

		return envFileContent.split('\n').reduce((acc, line) => {
			const [name, value] = line.split('=');
			if (name?.trim()) {
				acc[name.trim()] = (value ?? '').trim();
			}
			return acc;
		}, {} as Record<string, string>);
	} catch (err: unknown) {
		if (isErrnoException(err) && err.code === 'ENOENT') {
			return {};
		}
		throw err;
	}
};

export const autoDeployApps = async (
	appsDir: string,
	registry: ApplicationRegistry
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
			await deployProcess(resource, env, registry);
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
