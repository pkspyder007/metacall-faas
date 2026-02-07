import AppError from '@/utils/appError';
import type busboy from 'busboy';

export function isZipMimeType(mimeType: string): boolean {
	return (
		mimeType === 'application/x-zip-compressed' ||
		mimeType === 'application/zip'
	);
}

export function getUploadError(
	on: keyof busboy.BusboyEvents,
	error: Error
): AppError {
	const internalError = () => ({
		message: `Please upload your zip file again, Internal Server Error: ${error.toString()}`,
		code: 500
	});

	const errorUploadMessage: Record<
		string,
		{ message: string; code: number }
	> = {
		file: {
			message:
				'Error while fetching the zip file, please upload it again',
			code: 400
		},
		field: {
			message:
				'You might be sending improperly formed multipart form data fields or jsons',
			code: 400
		},
		finish: internalError()
	};

	const appError = errorUploadMessage[on.toString()] || internalError();
	return new AppError(appError.message, appError.code);
}
