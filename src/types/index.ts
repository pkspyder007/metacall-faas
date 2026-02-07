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
import type { InvokeQueueInterface } from '../utils/invoke';

export interface AppLocals {
	registry: ApplicationRegistry;
	invokeQueue: InvokeQueueInterface;
}

export interface AppRequest extends Request {
	app: Request['app'] & { locals: AppLocals };
}
