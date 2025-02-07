// import resolve from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
// import typescript from '@rollup/plugin-typescript';
// import dts from 'rollup-plugin-dts'; // create type def files
// import terser from '@rollup/plugin-terser'; // minify
// import peerDepsExternal from 'rollup-plugin-peer-deps-external'; // add peer deps in bundle
// import packageJson from './package.json';
import { rmSync } from 'node:fs';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

function cleanOldBuild() {
  return {
    name: 'clean-old-build',
    buildStart() {
      rmSync('./lib', { recursive: true, force: true });
    },
  };
}

export default [
  {
    input: ['src/index.ts'],
    output: [
      {
        dir: 'lib',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'src'
      },
    ],
    plugins: [
      cleanOldBuild(),
      typescript({
        tsconfig: 'tsconfig.build.json',
      }),
      nodeResolve({
        preferBuiltins: true,
        resolveOnly: (module) =>
          !module.includes('polkadot') &&
          !module.includes('gear-js/api') &&
          !module.includes('sails-js') &&
          !module.includes('sails-js-parser')
      }),
    ]
  },
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'lib/cjs',
        format: 'cjs',
        entryFileNames: '[name].cjs',
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named',
        strict: false,
      },
    ],
    plugins: [
      typescript({
        tsconfig: 'tsconfig.cjs.json'
      }),
      nodeResolve({
        preferBuiltins: true,
        resolveOnly: (module) =>
          !module.includes('polkadot') &&
          !module.includes('gear-js/api') &&
          !module.includes('sails-js') &&
          !module.includes('sails-js-parser')
      }),
      commonjs()
    ]
  }
];

// export default {
//   // Entry point of the application
//   input: 'src/index.ts',
//   output: [
//     {
//       // file: 'dist/index.cjs.js',
//       file: packageJson.main,
//       format: 'cjs', // CommonJS for Node.js
//       sourcemap: true, // Enable source maps
//     },
//     {
//       // file: 'dist/index.esm.js',
//       file: packageJson.module,
//       format: 'esm', // ES Modules for the browser
//       sourcemap: true, // Enable source maps
//     }
//   ],
//   plugins: [
//     typescript(), // TypeScript plugin
//   ],
//   external: [
//     'sails-js', 
//     'sails-js-parser',
//     '@gear-js/api', 
//     '@polkadot/api'
//   ], // External dependencies
// };