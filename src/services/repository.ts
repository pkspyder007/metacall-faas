import { Application, Resource } from '@/app';
import {
	parseBranchesFromStdout,
	repositoryDelete,
	repositoryName
} from '@/helpers/repository';
import type { ApplicationRegistry } from '@/registry/registry';
import AppError from '@/utils/appError';
import { exec } from '@/utils/exec';
import { findRunners } from '@/utils/install';
import { promises as fs } from 'fs';
import { join } from 'path';

export async function listBranches(
	url: string
): Promise<{ branches: string[] }> {
	const { stdout } = await exec(`git ls-remote --heads ${url}`);
	const branches = parseBranchesFromStdout(stdout);
	return { branches };
}

export async function listFiles(
	url: string,
	branch: string,
	appsDirectory: string
): Promise<{ files: string[] }> {
	const repoDir = repositoryName(url);
	const repoPath = join(appsDirectory, repoDir);

	await repositoryDelete(appsDirectory, url);

	await exec(
		`git clone --depth=1 --no-checkout --branch ${branch} ${url} ${repoPath}`
	);

	const { stdout } = await exec(`git ls-tree -r ${branch} --name-only`, {
		cwd: repoPath
	});

	const files = stdout.trim().split('\n').filter(Boolean);

	await fs.rm(repoPath, { recursive: true, force: true });

	return { files };
}

export async function cloneAndRegister(
	url: string,
	branch: string,
	registry: ApplicationRegistry,
	appsDirectory: string
): Promise<{ id: string }> {
	try {
		await repositoryDelete(appsDirectory, url);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		throw new AppError(
			`Error deleting repository directory: ${message}`,
			500
		);
	}

	try {
		await exec(
			`git clone --single-branch --depth=1 --branch ${branch} ${url} ${join(
				appsDirectory,
				repositoryName(url)
			)}`
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		throw new AppError(`Error cloning repository: ${message}`, 500);
	}

	const id = repositoryName(url);
	const resource: Resource = {
		id,
		path: join(appsDirectory, id),
		jsons: [],
		runners: await findRunners(join(appsDirectory, id))
	};

	registry.set(id, new Application());
	const application = registry.get(id);
	if (!application) {
		throw new AppError(`Application not found: ${id}`, 404);
	}
	application.resource = Promise.resolve(resource);

	return { id };
}
