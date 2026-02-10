import { getConfig } from '@/config';
import { uploadAndRegister } from '@/services/package';
import { AppLocals } from '@/types';
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from './catch';

export const packageUpload = catchAsync(
	async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
		const { registry } = req.app.locals as AppLocals;
		const result = await uploadAndRegister(
			req,
			registry,
			getConfig().appsDirectory
		);
		res.status(201).json(result);
	}
);
