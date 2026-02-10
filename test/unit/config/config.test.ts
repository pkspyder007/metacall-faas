import {
	clearConfigOverrides,
	getConfig,
	setConfigOverrides
} from '../../../src/config';

describe('config', () => {
	const savedPort = process.env.PORT;

	afterEach(() => {
		clearConfigOverrides();
		if (savedPort !== undefined) {
			process.env.PORT = savedPort;
		} else {
			delete process.env.PORT;
		}
	});

	describe('getConfig', () => {
		it('should return default config when no overrides', () => {
			delete process.env.PORT;
			const config = getConfig();
			expect(config.port).toBe(9000);
			expect(config.apiVersion).toBe('v1');
			expect(typeof config.prefix).toBe('string');
			expect(config.appsDirectory).toContain('apps');
		});

		it('should use PORT from environment when set', () => {
			process.env.PORT = '3000';
			const config = getConfig();
			expect(config.port).toBe(3000);
		});

		it('should fallback to 9000 when PORT is not a number', () => {
			process.env.PORT = 'invalid';
			const config = getConfig();
			expect(config.port).toBe(9000);
		});
	});

	describe('setConfigOverrides', () => {
		it('should override port', () => {
			setConfigOverrides({ port: 8080 });
			const config = getConfig();
			expect(config.port).toBe(8080);
		});

		it('should override appsDirectory', () => {
			setConfigOverrides({ appsDirectory: '/custom/apps' });
			const config = getConfig();
			expect(config.appsDirectory).toBe('/custom/apps');
		});

		it('should override prefix and apiVersion', () => {
			setConfigOverrides({ prefix: 'my-prefix', apiVersion: 'v2' });
			const config = getConfig();
			expect(config.prefix).toBe('my-prefix');
			expect(config.apiVersion).toBe('v2');
		});

		it('should merge with existing overrides', () => {
			setConfigOverrides({ port: 1000 });
			setConfigOverrides({ apiVersion: 'v2' });
			const config = getConfig();
			expect(config.port).toBe(1000);
			expect(config.apiVersion).toBe('v2');
		});
	});

	describe('clearConfigOverrides', () => {
		it('should reset overrides so getConfig returns env/defaults again', () => {
			setConfigOverrides({ port: 9999 });
			expect(getConfig().port).toBe(9999);
			clearConfigOverrides();
			delete process.env.PORT;
			expect(getConfig().port).toBe(9000);
		});
	});
});
