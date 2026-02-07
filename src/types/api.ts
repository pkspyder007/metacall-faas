/**
 * Request/response DTOs used by controllers and services.
 */

export type DeployBody = {
	suffix: string;
	resourceType: 'Package' | 'Repository';
	release: string;
	env: EnvVar[];
	plan: string;
	version: string;
};

export type DeleteBody = {
	suffix: string;
	prefix: string;
	version: string;
};

export type FetchBranchListBody = {
	url: string;
};

export type FetchFilesFromRepoBody = {
	branch: string;
	url: string;
};

export type EnvVar = {
	name: string;
	value: string;
};
