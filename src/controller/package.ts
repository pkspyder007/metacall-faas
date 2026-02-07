import { getConfig } from '@/config';
import { uploadAndRegister } from '@/services/package';
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from './catch';

export const packageUpload = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const result = await uploadAndRegister(
			req,
			req.app.locals.registry,
			getConfig().appsDirectory
		);
		res.status(201).json(result);
	}
);
