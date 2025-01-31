import typescript from '@rollup/plugin-typescript';

export default {
  // Entry point of the application
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs', // CommonJS for Node.js
      sourcemap: true, // Enable source maps
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm', // ES Modules for the browser
      sourcemap: true, // Enable source maps
    }
  ],
  plugins: [
    typescript(), // TypeScript plugin
  ],
  external: [
    'axios', 
    'sails-js', 
    '@gear-js/api', 
    '@polkadot/api'
  ], // External dependencies
};