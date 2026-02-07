import type { ApplicationRegistry } from '@/registry/registry';
import { Deployment } from '@metacall/protocol';
import { Request, Response } from 'express';

export const inspect = (req: Request, res: Response): Response => {
	const deployments: Deployment[] = [];

	const registry = req.app.locals.registry as ApplicationRegistry;

	for (const application of registry.values()) {
		// Check if the application is deployed
		if (application.deployment) {
			// Ensure packages is not undefined or null
			if (!application.deployment.packages) {
				throw new Error('Packages is undefined or null');
			}
			deployments.unshift(application.deployment);
		}
	}

	return res.send(deployments);
};
