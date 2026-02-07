import { promises as fs } from 'fs';
import path from 'path';

export const exists = async (path: string): Promise<boolean> => {
	try {
		await fs.stat(path);
		return true;
	} catch {
		return false;
	}
};

export const ensureFolderExists = async <Path extends string>(
	dirPath: Path
): Promise<Path> => (
	(await exists(dirPath)) || (await fs.mkdir(dirPath, { recursive: true })),
	dirPath
);

export async function pruneDirectory(dir: string): Promise<void> {
	const entries = await fs.readdir(dir);
	await Promise.all(
		entries.map(entry =>
			fs.rm(path.join(dir, entry), { recursive: true, force: true })
		)
	);
}
