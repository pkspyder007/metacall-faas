import type { Application } from '@/app';

export interface ApplicationRegistry {
	get(id: string): Application | undefined;
	set(id: string, application: Application): void;
	delete(id: string): void;
	values(): Application[];
}
