import type { ApplicationRegistry } from '@/registry/registry';
import type { Deployment } from '@metacall/protocol';

export function listDeployments(registry: ApplicationRegistry): Deployment[] {
	const deployments: Deployment[] = [];

	for (const application of registry.values()) {
		if (application.deployment) {
			if (!application.deployment.packages) {
				throw new Error('Packages is undefined or null');
			}
			deployments.unshift(application.deployment);
		}
	}

	return deployments;
}
