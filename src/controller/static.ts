import { NextFunction, Request, Response } from 'express';
import path from 'path';

import { getConfig } from '@/config';
import { exists } from '@/helpers/fs';
import type { AppLocals } from '@/types';
import AppError from '../utils/appError';
import { catchAsync } from './catch';

export const serveStatic = catchAsync(
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		if (!req.params) {
			throw new AppError('Invalid API endpoint', 404);
		}

		const { suffix, file } = req.params;
		const { registry } = req.app.locals as AppLocals;
		const application = registry.get(suffix);

		if (!application?.proc) {
			return next(
				new AppError(
					`Oops! It looks like the application '${suffix}' hasn't been deployed yet. Please deploy it before you can call its functions.`,
					404
				)
			);
		}

		const appsDirectory = getConfig().appsDirectory;
		const filePath = path.join(appsDirectory, suffix, file);

		if (!(await exists(filePath))) {
			return next(
				new AppError(
					'The file you are looking for might not be available or the application may not be deployed.',
					404
				)
			);
		}

		return res.status(200).sendFile(filePath);
	}
);
