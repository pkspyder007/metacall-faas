import { hostname } from 'os';
import { join } from 'path';
import { configDir } from '../utils/config';

const basePath = configDir(join('metacall', 'faas'));
const appsDirectory = join(basePath, 'apps');

export interface AppConfig {
	port: number;
	appsDirectory: string;
	prefix: string;
	apiVersion: string;
}

let overrides: Partial<AppConfig> = {};

export function getConfig(): AppConfig {
	return {
		port: overrides.port ?? (Number(process.env.PORT) || 9000),
		appsDirectory: overrides.appsDirectory ?? appsDirectory,
		prefix: overrides.prefix ?? hostname(),
		apiVersion: overrides.apiVersion ?? 'v1'
	};
}

export function setConfigForTest(partial: Partial<AppConfig>): void {
	overrides = { ...overrides, ...partial };
}

export function clearConfigOverrides(): void {
	overrides = {};
}
