import crypto from 'crypto';

export interface Invocation {
	resolve: (value: string) => void;
	reject: (reason: string) => void;
}

export interface InvokeQueueInterface {
	push(invoke: Invocation): string;
	get(id: string): Invocation | undefined;
}

export class InvokeQueue implements InvokeQueueInterface {
	private queue: Record<string, Invocation> = {};

	public push(invoke: Invocation): string {
		const id = crypto.randomBytes(16).toString('hex');
		this.queue[id] = invoke;
		return id;
	}

	public get(id: string): Invocation {
		const invoke = this.queue[id];
		delete this.queue[id];
		return invoke;
	}
}
