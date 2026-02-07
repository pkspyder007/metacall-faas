import { listDeployments } from '@/services/inspect';
import { AppLocals } from '@/types';
import type { Request, Response } from 'express';

export const inspect = (req: Request, res: Response): Response => {
	const { registry } = req.app.locals as AppLocals;
	return res.send(listDeployments(registry));
};
