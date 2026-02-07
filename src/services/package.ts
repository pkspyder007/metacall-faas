import * as fs from 'fs';
import os from 'os';
import path from 'path';

import busboy from 'busboy';
import { Request } from 'express';
import { Extract } from 'unzipper';

import { Application, Resource } from '@/app';
import { ensureFolderExists } from '@/helpers/fs';
import { getUploadError, isZipMimeType } from '@/helpers/upload';
import type { ApplicationRegistry } from '@/registry/registry';
import AppError from '@/utils/appError';
import { MetaCallJSON } from '@metacall/protocol/deployment';

export async function uploadAndRegister(
	req: Request,
	registry: ApplicationRegistry,
	appsDirectory: string
): Promise<{ id: string }> {
	return new Promise((resolve, reject) => {
		const bb = busboy({ headers: req.headers });
		const resource: Resource = {
			id: '',
			type: '',
			path: '',
			jsons: [],
			runners: []
		};

		let fileResolve: (value?: unknown) => void;
		const filePromise = new Promise<unknown>(resolveFile => {
			fileResolve = resolveFile;
		});

		const errorHandler = (error: AppError) => {
			req.unpipe(bb);
			reject(error);
		};

		const eventHandler = <T>(
			type: keyof busboy.BusboyEvents,
			listener: T
		) => {
			bb.on(type, (...args: unknown[]) => {
				try {
					const fn = listener as unknown as (
						...args: unknown[]
					) => void;
					fn(...args);
				} catch (e) {
					errorHandler(getUploadError(type, e as Error));
				}
			});
		};

		eventHandler(
			'file',
			(
				_name: string,
				file: fs.ReadStream,
				info: { encoding: string; filename: string; mimeType: string }
			) => {
				const { mimeType, filename } = info;

				if (!isZipMimeType(mimeType)) {
					return errorHandler(
						new AppError('Please upload a zip file', 404)
					);
				}

				const appLocation = path.join(appsDirectory, resource.id);
				resource.path = appLocation;

				fs.mkdtemp(
					path.join(os.tmpdir(), `metacall-faas-${resource.id}-`),
					(err, folder) => {
						if (err !== null) {
							return errorHandler(
								new AppError(
									'Failed to create temporary directory for the blob',
									500
								)
							);
						}

						resource.blob = path.join(folder, filename);

						ensureFolderExists(appLocation)
							.then(() => {
								file.pipe(
									fs.createWriteStream(
										resource.blob as string
									)
								).on('finish', () => {
									fileResolve();
								});
							})
							.catch((error: Error) => {
								errorHandler(
									new AppError(
										`Failed to create folder for the resource at: ${appLocation} - ${error.toString()}`,
										404
									)
								);
							});
					}
				);
			}
		);

		eventHandler('field', (name: keyof Resource, val: string) => {
			if (name === 'runners') {
				resource.runners = JSON.parse(val) as string[];
			} else if (name === 'jsons') {
				resource.jsons = JSON.parse(val) as MetaCallJSON[];
			} else {
				resource[name] = val;
			}
		});

		eventHandler('finish', () => {
			if (resource.blob === undefined) {
				reject(
					new Error('Invalid file upload, blob path is not defined')
				);
				return;
			}

			const deleteBlob = () => {
				if (resource.blob !== undefined) {
					fs.unlink(resource.blob, err => {
						if (err !== null) {
							errorHandler(
								new AppError(
									`Failed to delete the blob at: ${err.toString()}`,
									500
								)
							);
						}
					});
				}
			};

			const deleteFolder = () => {
				if (resource.path !== undefined) {
					fs.unlink(resource.path, err => {
						if (err !== null) {
							errorHandler(
								new AppError(
									`Failed to delete the path at: ${err.toString()}`,
									500
								)
							);
						}
					});
				}
			};

			if (registry.get(resource.id)) {
				reject(
					new AppError(
						`There is an application with name '${resource.id}' already deployed, delete it first.`,
						400
					)
				);
				return;
			}

			let resourceResolve: (
				value: Resource | PromiseLike<Resource>
			) => void;
			let resourceReject: (reason?: unknown) => void;

			registry.set(resource.id, new Application());

			const application = registry.get(resource.id);
			if (!application) {
				reject(
					new AppError(`Application not found: ${resource.id}`, 404)
				);
				return;
			}

			application.resource = new Promise<Resource>((res, rej) => {
				resourceResolve = res;
				resourceReject = rej;
			});

			const unzipAndResolve = () =>
				new Promise<void>((res, rej) => {
					fs.createReadStream(resource.blob as string)
						.pipe(Extract({ path: resource.path }))
						.on('close', () => {
							deleteBlob();
							res();
						})
						.on('error', error => {
							deleteBlob();
							deleteFolder();
							rej(
								new AppError(
									`Failed to unzip the resource at: ${error.toString()}`,
									500
								)
							);
						});
				});

			void filePromise.then(() => {
				unzipAndResolve()
					.then(() => {
						resourceResolve(resource);
						resolve({ id: resource.id });
					})
					.catch(error => {
						resourceReject(error);
						reject(error);
					});
			});
		});

		eventHandler('close', () => {
			// Do nothing
		});

		req.pipe(bb);
	});
}
