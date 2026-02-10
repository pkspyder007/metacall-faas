import { getConfig } from '@/config';
import { deleteDeployment } from '@/services/deployment';
import type { AppLocals, DeleteBody } from '@/types';
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from './catch';

export const deployDelete = catchAsync(
	async (
		req: Omit<Request, 'body'> & { body: DeleteBody },
		res: Response,
		_next: NextFunction
	): Promise<Response> => {
		const { suffix } = req.body;
		const { registry } = req.app.locals as AppLocals;
		await deleteDeployment(suffix, registry, getConfig().appsDirectory);
		return res.send('Deploy Delete Succeed');
	}
);
