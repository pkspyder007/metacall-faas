import { callFunction } from './controller/call';
import { deployDelete } from './controller/delete';
import { deploy } from './controller/deploy';
import { globalError } from './controller/error';
import { inspect } from './controller/inspect';
import { logs } from './controller/logs';
import { packageUpload } from './controller/package';
import {
	repositoryBranchList,
	repositoryClone,
	repositoryFileList
} from './controller/repository';
import { serveStatic } from './controller/static';
import { validate } from './controller/validate';

import express, { Express, NextFunction, Request, Response } from 'express';

import { getConfig } from './config';
import { InMemoryApplicationRegistry } from './registry/in-memory-registry';
import { ApplicationRegistry } from './registry/registry';
import AppError from './utils/appError';
import { InvokeQueue, InvokeQueueInterface } from './utils/invoke';

export function initializeAPI(options: {
	registry: ApplicationRegistry;
	invokeQueue: InvokeQueueInterface;
}): Express {
	const app = express();
	const host = getConfig().prefix;

	app.locals.registry =
		options?.registry ?? new InMemoryApplicationRegistry();
	app.locals.invokeQueue = options?.invokeQueue ?? new InvokeQueue();

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	app.get('/readiness', (_req: Request, res: Response) =>
		res.sendStatus(200)
	);
	app.get('/validate', validate);
	app.get('/api/account/deploy-enabled', validate);

	app.get(`/${host}/:suffix/:version/call/:func`, callFunction);
	app.post(`/${host}/:suffix/:version/call/:func`, callFunction);
	app.get(
		`/${host}/:suffix/:version/static/.metacall/faas/apps/:file`,
		serveStatic
	);

	app.post('/api/package/create', packageUpload);

	app.post('/api/repository/branchlist', repositoryBranchList);
	app.post('/api/repository/filelist', repositoryFileList);
	app.post('/api/repository/add', repositoryClone);

	app.post('/api/deploy/create', deploy);
	app.post('/api/deploy/logs', logs);
	app.post('/api/deploy/delete', deployDelete);

	app.get('/api/inspect', inspect);

	app.get(
		'/api/billing/list-subscriptions',
		(_req: Request, res: Response) => {
			return res.status(200).json(['Essential', 'Essential']);
		}
	);
	app.post(
		'/api/billing/list-subscriptions',
		(_req: Request, res: Response) => {
			return res.status(200).json(['Essential', 'Essential']);
		}
	);
	app.get(
		'/api/billing/list-subscriptions-deploys',
		(_req: Request, res: Response) => {
			return res.status(200).json([]);
		}
	);
	app.post(
		'/api/billing/list-subscriptions-deploys',
		(_req: Request, res: Response) => {
			return res.status(200).json([]);
		}
	);

	// For all the additional unimplemented routes
	app.all('*', (req: Request, res: Response, next: NextFunction) => {
		next(
			new AppError(`Can't find ${req.originalUrl} on this server!`, 404)
		);
	});

	app.use(globalError);

	return app;
}
