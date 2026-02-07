import { listDeployments } from '@/services/inspect';
import type { Request, Response } from 'express';

export const inspect = (req: Request, res: Response): Response => {
	const registry = req.app.locals.registry;
	return res.send(listDeployments(registry));
};
