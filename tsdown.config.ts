import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  target: 'node26',
  platform: 'node',
  outDir: 'dist',
  // Keep `dist/index.js` (type: module) instead of tsdown's default `.mjs` for node.
  fixedExtension: false,
  sourcemap: true,
  clean: true,
  minify: false,
  // The "@/*" alias resolves from tsconfig.json's `paths` (tsdown's `tsconfig: true` default).
});
