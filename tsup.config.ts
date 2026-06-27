import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node26',
  platform: 'node',
  outDir: 'dist',
  bundle: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  // Resolve the "@/*" tsconfig path alias when bundling.
  esbuildOptions(options) {
    options.alias = {
      '@': new URL('./src', import.meta.url).pathname,
    };
  },
});
