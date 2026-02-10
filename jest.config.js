/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	testMatch: ['**/*.test.ts'],
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: {
					module: 'commonjs',
					esModuleInterop: true,
					baseUrl: '.',
					paths: { '@/*': ['./src/*'] },
					types: ['node', 'jest']
				}
			}
		]
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/src/$1'
	},
	collectCoverageFrom: ['src/**/*.ts', '!src/index.ts', '!**/*.d.ts'],
	coverageDirectory: 'coverage',
	verbose: true
};
