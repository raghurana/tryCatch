import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { build } from 'esbuild';

rmSync('dist', { recursive: true, force: true });
execSync('tsc --project tsconfig.build.json', { stdio: 'inherit' });

const shared = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  sourcemap: true,
  minify: true,
  keepNames: true,
  legalComments: 'none',
} satisfies Parameters<typeof build>[0];

await build({
  ...shared,
  platform: 'neutral',
  format: 'esm',
  outfile: 'dist/esm/index.js',
});

await build({
  ...shared,
  platform: 'neutral',
  format: 'cjs',
  outfile: 'dist/cjs/index.cjs',
});
