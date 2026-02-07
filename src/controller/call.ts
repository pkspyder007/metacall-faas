import { invoke } from '@/services/call';
import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/appError';

export const callFunction = (
	req: Request,
	res: Response,
	next: NextFunction
): Response | void => {
	if (!req.params?.suffix) {
		return next(
			new AppError('A the deployment name (suffix) is required.', 404)
		);
	}

	if (!req.params?.func) {
		return next(
			new AppError(
				'A function name is required in the path; i.e: /call/sum.',
				404
			)
		);
	}

	const { suffix, func } = req.params;
	const args = Object.values(req.body);

	try {
		invoke(
			suffix,
			func,
			args,
			req.app.locals.registry,
			req.app.locals.invokeQueue,
			(data: string) => res.send(data),
			(error: string) => res.status(500).send(error)
		);
	} catch (err) {
		return next(err);
	}
};
