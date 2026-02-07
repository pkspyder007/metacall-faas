import type { EnvVar } from '@/types';
import * as fsSync from 'fs';
import { promises as fs } from 'fs';

const isErrnoException = (err: unknown): err is NodeJS.ErrnoException =>
	err instanceof Error && 'code' in err;

export function parseEnvFromBody(env: EnvVar[]): Record<string, string> {
	return env.reduce((acc, { name, value }) => {
		acc[name] = value;
		return acc;
	}, {} as Record<string, string>);
}

export async function readEnvFile(
	envFilePath: string
): Promise<Record<string, string>> {
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
}

export function writeEnvToFile(
	filePath: string,
	env: Record<string, string>,
	encoding: BufferEncoding = 'utf-8'
): void {
	const content = Object.entries(env)
		.map(([key, value]) => `${key}=${value}`)
		.join('\n');
	fsSync.appendFileSync(filePath, content, encoding);
}
