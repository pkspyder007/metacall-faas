import type { ApplicationRegistry } from '@/registry/registry';
import AppError from '@/utils/appError';
import type { InvokeQueueInterface } from '@/utils/invoke';
import { WorkerMessageType } from '@/worker/protocol';

export function invoke(
	suffix: string,
	func: string,
	args: unknown[],
	registry: ApplicationRegistry,
	invokeQueue: InvokeQueueInterface,
	onResolve: (data: string) => void,
	onReject: (error: string) => void
): void {
	const application = registry.get(suffix);

	if (!application?.proc) {
		throw new AppError(
			`Oops! It looks like the application '${suffix}' has not been deployed yet. Please deploy it before you can call its functions.`,
			404
		);
	}

	const id = invokeQueue.push({
		resolve: onResolve,
		reject: onReject
	});

	application.proc.send({
		type: WorkerMessageType.Invoke,
		data: {
			id,
			name: func,
			args
		}
	});
}
