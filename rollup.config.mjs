import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs', // CommonJS para Node.js
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm', // ES Modules para el navegador
    }
  ],
  plugins: [typescript()],
  external: ['axios', 'sails-js', '@gear-js/api', '@polkadot/api'],
};