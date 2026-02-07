import { writeEnvToFile } from '@/helpers/env';
import type { ApplicationRegistry } from '@/registry/registry';
import AppError from '@/utils/appError';
import { deployProcess } from '@/utils/deploy';
import { installDependencies } from '@/utils/install';
import type { InvokeQueue } from '@/utils/invoke';
import { rm } from 'fs/promises';
import path from 'path';

export type CreateDeploymentResult = {
	prefix: string;
	suffix: string;
	version: string;
};

export async function createDeployment(
	suffix: string,
	env: Record<string, string>,
	registry: ApplicationRegistry,
	invokeQueue: InvokeQueue
): Promise<CreateDeploymentResult> {
	const application = registry.get(suffix);

	if (!application?.resource) {
		throw new AppError(`Invalid deployment id: ${suffix}`, 400);
	}

	const resource = await application.resource;

	const envFilePath = path.join(resource.path, '.env');
	writeEnvToFile(envFilePath, env);

	await installDependencies(resource);

	await deployProcess(resource, env, registry, invokeQueue);

	const deployment = application.deployment;
	if (!deployment) {
		throw new AppError('Deploy did not produce deployment', 500);
	}

	return {
		prefix: deployment.prefix,
		suffix: deployment.suffix,
		version: deployment.version
	};
}

export async function deleteDeployment(
	suffix: string,
	registry: ApplicationRegistry,
	appsDirectory: string
): Promise<void> {
	const application = registry.get(suffix);

	if (!application) {
		throw new AppError(
			`Oops! It looks like the application '${suffix}' doesn't exist. Please create it before you delete it.`,
			404
		);
	}

	if (!application.proc) {
		throw new AppError(
			`Oops! It looks like the application '${suffix}' hasn't been deployed yet. Please deploy it before you delete it.`,
			404
		);
	}

	application.kill();
	registry.delete(suffix);

	const appLocation = path.join(appsDirectory, suffix);
	await rm(appLocation, { recursive: true, force: true });
}
