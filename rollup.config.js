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

// function fixTypesDeclaration() {
//   return {
//     name: 'fix-types-declaration',
//     writeBundle() {
//       const typesFilePath = './lib/types.d.ts';
//       const content = readFileSync(typesFilePath, 'utf-8');

//       const fixedContent = `
// export type * from './types';
// export { SailsCalls } from './SailsCalls';
//       `.trim();

//       writeFileSync(typesFilePath, fixedContent, 'utf-8');
//     },
//   };
// }

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
          !module.includes('sails-js-parser') &&
          !module.includes('decimal.js')
      }),
      // fixTypesDeclaration()
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
          !module.includes('sails-js-parser') &&
          !module.includes('decimal.js')
      }),
      commonjs()
    ]
  },
];
