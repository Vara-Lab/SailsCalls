import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  clearMocks: true,
  coverageProvider: 'v8',
  testEnvironment: 'node',
  verbose: true,
  preset: 'ts-jest/presets/js-with-babel',
  transformIgnorePatterns: ['node_modules/(?!@polkadot)/'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  testTimeout: 15_000,
};

export default config;


// export default {
//     preset: 'ts-jest/presets/default-esm',  // Usa el preset ESM de ts-jest
//     testEnvironment: 'node',
//     transform: {
//       '^.+\\.tsx?$': [
//         'ts-jest',
//         {
//           useESM: true,  // Usa ES Modules
//         },
//       ],
//     },
//     extensionsToTreatAsEsm: ['.ts'], // Trata .ts como ES Modules
//     moduleNameMapper: {
//       '^(\\.{1,2}/.*)\\.js$': '$1',  // Mapea imports de archivos ES Modules
//     },
//   };