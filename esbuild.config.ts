import { execSync } from 'node:child_process';
import { copyFileSync, rmSync } from 'node:fs';
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
  outfile: 'dist/neutral/index.js',
});

await build({
  ...shared,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/node/index.js',
});

await build({
  ...shared,
  platform: 'node',
  format: 'cjs',
  outfile: 'dist/node/index.cjs',
});

await build({
  ...shared,
  platform: 'browser',
  format: 'esm',
  outfile: 'dist/browser/index.js',
});

copyFileSync('dist/neutral/index.d.ts', 'dist/node/index.d.ts');
copyFileSync('dist/neutral/index.d.ts', 'dist/browser/index.d.ts');
