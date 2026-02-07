import { getConfig } from '@/config';
import {
	cloneAndRegister,
	listBranches,
	listFiles
} from '@/services/repository';
import type { FetchBranchListBody, FetchFilesFromRepoBody } from '@/types';
import { NextFunction, Request, Response } from 'express';
import { catchAsync } from './catch';

export const repositoryBranchList = catchAsync(
	async (
		req: Omit<Request, 'body'> & { body: FetchBranchListBody },
		res: Response,
		_next: NextFunction
	) => {
		const { url } = req.body;
		const result = await listBranches(url);
		return res.status(200).json(result);
	}
);

export const repositoryFileList = catchAsync(
	async (
		req: Omit<Request, 'body'> & { body: FetchFilesFromRepoBody },
		res: Response,
		_next: NextFunction
	) => {
		const { url, branch } = req.body;
		const appsDirectory = getConfig().appsDirectory;
		const result = await listFiles(url, branch, appsDirectory);
		return res.status(200).json(result);
	}
);

export const repositoryClone = catchAsync(
	async (
		req: Omit<Request, 'body'> & { body: FetchFilesFromRepoBody },
		res: Response,
		_next: NextFunction
	) => {
		const { branch, url } = req.body;
		const result = await cloneAndRegister(
			url,
			branch,
			req.app.locals.registry,
			getConfig().appsDirectory
		);
		return res.status(201).send(result);
	}
);
