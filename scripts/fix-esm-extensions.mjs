import { promises as fs } from 'node:fs';
import { join, dirname, extname } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const JS_EXTS = new Set(['.js', '.mjs', '.cjs', '.json']);

async function* walk(dir) {
  for (const dirent of await fs.readdir(dir, { withFileTypes: true })) {
    const res = join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* walk(res);
    } else {
      yield res;
    }
  }
}

function needsExtension(spec) {
  // Only touch relative paths
  if (!(spec.startsWith('./') || spec.startsWith('../'))) return false;
  // Skip if it already has a known extension
  const ext = extname(spec);
  if (JS_EXTS.has(ext)) return false;
  // Skip data/url-like imports
  if (spec.startsWith('data:') || spec.startsWith('http://') || spec.startsWith('https://')) return false;
  return true;
}

function addJsExtension(spec) {
  // Append .js to relative path without extension
  return `${spec}.js`;
}

function rewrite(code) {
  // Handle: import ... from '...'; export ... from '...'; import('...'); and side-effect imports: import '...';
  // We only change the string literal when it is a relative path without extension.
  return code
    // import ... from '...'; and export ... from '...'; and side-effect imports
    .replace(/(import\s+[^'"\n;]*?from\s*|export\s+[^'"\n;]*?from\s*|import\s*)(['"])(\.\.?\/[^'"\)]+)\2/g, (m, prefix, quote, spec) => {
      if (!needsExtension(spec)) return m;
      return `${prefix}${quote}${addJsExtension(spec)}${quote}`;
    })
    // dynamic import: import('...')
    .replace(/import\(\s*(['"])(\.\.?\/[^'"\)]+)\1\s*\)/g, (m, quote, spec) => {
      if (!needsExtension(spec)) return m;
      return `import(${quote}${addJsExtension(spec)}${quote})`;
    });
}

async function main() {
  for await (const file of walk(distDir)) {
    if (!file.endsWith('.js') && !file.endsWith('.mjs') && !file.endsWith('.cjs')) continue;
    const src = await fs.readFile(file, 'utf8');
    const out = rewrite(src);
    if (out !== src) {
      await fs.writeFile(file, out, 'utf8');
    }
  }
}

main().catch((err) => {
  console.error('[fix-esm-extensions] Failed:', err);
  process.exit(1);
});
