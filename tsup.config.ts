import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/**/*.ts',
    '!src/**/*.test.ts',
    '!src/ui/**/*'
  ],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  shims: true,
  splitting: false,
  skipNodeModulesBundle: true,
  external: [
    'vite',
    'webpack',
    'rollup',
    'fontkit',
    'opentype.js',
    'fontmin',
    'wawoff2',
    'pako',
    'unplugin',
    'commander',
    'inquirer',
    'chalk',
    'ora',
    'cli-progress',
    'glob'
  ],
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : '.js'
    }
  }
})