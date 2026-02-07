import { parseEnvFromBody } from '@/helpers/env';
import { createDeployment } from '@/services/deployment';
import type { DeployBody } from '@/types';
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from './catch';

export const deploy = catchAsync(
	async (
		req: Omit<Request, 'body'> & { body: DeployBody },
		res: Response,
		_next: NextFunction
	) => {
		const env = parseEnvFromBody(req.body.env);
		const result = await createDeployment(
			req.body.suffix,
			env,
			req.app.locals.registry,
			req.app.locals.invokeQueue
		);
		return res.status(200).json(result);
	}
);
