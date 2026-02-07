import type { Application } from '@/app';
import { ApplicationRegistry } from './registry';

export class InMemoryApplicationRegistry implements ApplicationRegistry {
	private applications: Map<string, Application> = new Map();

	get(id: string): Application | undefined {
		return this.applications.get(id);
	}

	set(id: string, application: Application): void {
		this.applications.set(id, application);
	}

	delete(id: string): void {
		this.applications.delete(id);
	}

	values(): Application[] {
		return Array.from(this.applications.values());
	}
}
