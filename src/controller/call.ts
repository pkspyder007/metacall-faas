import { invoke } from '@/services/call';
import { AppLocals } from '@/types';
import { NextFunction, Request, Response } from 'express';
import AppError from '../utils/appError';

export const callFunction = (
	req: Request<
		{ suffix: string; func: string },
		string,
		Record<string, unknown>
	>,
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
	const { registry, invokeQueue } = req.app.locals as AppLocals;
	try {
		invoke(
			suffix,
			func,
			args,
			registry,
			invokeQueue,
			(data: string) => res.send(data),
			(error: string) => res.status(500).send(error)
		);
	} catch (err) {
		return next(err);
	}
};
