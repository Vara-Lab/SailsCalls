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

const externals = [
  '@gear-js/api',
  'sails-js',
  'sails-js-parser',
  'decimal.js',
  /^@polkadot\// 
];

export default [
  {
    input: ['src/index.ts'],
    external: externals,
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
      typescript({ tsconfig: 'tsconfig.build.json' }),
      nodeResolve({ preferBuiltins: true }),
    ]
  },
  {
    input: 'src/index.ts',
    external: externals,
    output: [
      {
        dir: 'lib/cjs',
        format: 'cjs',
        entryFileNames: '[name].cjs',
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named',
        strict: false
      },
    ],
    plugins: [
      typescript({ tsconfig: 'tsconfig.cjs.json' }),
      nodeResolve({ preferBuiltins: true }),
      commonjs()
    ]
  }
];
