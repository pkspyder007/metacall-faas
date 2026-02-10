export type {
	DeleteBody,
	DeployBody,
	EnvVar,
	FetchBranchListBody,
	FetchFilesFromRepoBody
} from './api';

export type { IAppError } from './errors';

export type { Application, Resource } from '../app';

import type { Request } from 'express';
import type { ApplicationRegistry } from '../registry/registry';
import type { InvokeQueue } from '../utils/invoke';

export interface AppLocals {
	registry: ApplicationRegistry;
	invokeQueue: InvokeQueue;
}

export interface AppRequest extends Request {
	app: Request['app'] & { locals: AppLocals };
}
