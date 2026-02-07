import type { IAppError } from '@/types';
import { NextFunction, Request, Response } from 'express';

export const globalError = (
	err: IAppError | Error,
	_req: Request,
	res: Response,
	_next: NextFunction
): Response => {
	const statusCode =
		'statusCode' in err && typeof err.statusCode === 'number'
			? err.statusCode
			: 500;
	const message = err instanceof Error ? err.message : String(err);

	if (
		process.env.NODE_ENV === 'development' &&
		err instanceof Error &&
		err.stack
	) {
		// eslint-disable-next-line no-console
		console.log(`Status Code: ${statusCode}\n${err.stack}`);
	}

	return res.status(statusCode).send(message);
};
