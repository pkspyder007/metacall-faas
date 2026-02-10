import { platform } from 'os';
import { join } from 'path';
import { configDir } from '../../../src/utils/config';

describe('utils/config', () => {
	const savedEnv: Partial<NodeJS.ProcessEnv> = {};

	beforeAll(() => {
		savedEnv.HOME = process.env.HOME;
		savedEnv.APPDATA = process.env.APPDATA;
	});

	afterEach(() => {
		if (savedEnv.HOME !== undefined) {
			process.env.HOME = savedEnv.HOME;
		} else {
			delete process.env.HOME;
		}
		if (savedEnv.APPDATA !== undefined) {
			process.env.APPDATA = savedEnv.APPDATA;
		} else {
			delete process.env.APPDATA;
		}
	});

	describe('configDir', () => {
		it('should return path under HOME with dot-prefix on non-Windows', () => {
			if (platform() === 'win32') return;
			process.env.HOME = '/home/user';
			const result = configDir('metacall/faas');
			expect(result).toBe(join('/home/user', '.metacall/faas'));
		});

		it('should return path under APPDATA on Windows', () => {
			if (platform() !== 'win32') return;
			process.env.APPDATA = 'C:\\Users\\user\\AppData\\Roaming';
			const result = configDir(join('metacall', 'faas'));
			expect(result).toBe(
				join('C:\\Users\\user\\AppData\\Roaming', 'metacall', 'faas')
			);
		});

		it('should throw when HOME is missing on non-Windows', () => {
			if (platform() === 'win32') return;
			delete process.env.HOME;
			expect(() => configDir('foo')).toThrow(
				'Missing HOME environment variable! Unable to load config'
			);
		});

		it('should throw when APPDATA is missing on Windows', () => {
			if (platform() !== 'win32') return;
			delete process.env.APPDATA;
			expect(() => configDir('foo')).toThrow(
				'Missing APPDATA environment variable! Unable to load config'
			);
		});
	});
});
