import { promises as fs } from 'fs';
import path from 'path';

export function repositoryName(url: string): string {
	return url
		.replace(/\.git$/, '')
		.split('/')
		.slice(-2)
		.join('-')
		.toLowerCase();
}

export async function repositoryDelete(
	appsDir: string,
	url: string
): Promise<void> {
	const folder = repositoryName(url);
	const repoFilePath = path.join(appsDir, folder);
	await fs.rm(repoFilePath, { recursive: true, force: true });
}

export function parseBranchesFromStdout(stdout: string): string[] {
	return stdout
		.trim()
		.split('\n')
		.map(line => line.split('refs/heads/')[1])
		.filter(Boolean);
}
