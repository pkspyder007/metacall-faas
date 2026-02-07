import { getConfig } from '@/config';
import { deleteDeployment } from '@/services/deployment';
import type { DeleteBody } from '@/types';
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from './catch';

export const deployDelete = catchAsync(
	async (
		req: Omit<Request, 'body'> & { body: DeleteBody },
		res: Response,
		_next: NextFunction
	): Promise<Response> => {
		const { suffix } = req.body;
		await deleteDeployment(
			suffix,
			req.app.locals.registry,
			getConfig().appsDirectory
		);
		return res.send('Deploy Delete Succeed');
	}
);
