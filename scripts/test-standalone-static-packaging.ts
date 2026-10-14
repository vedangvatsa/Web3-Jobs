import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test, type TestContext } from 'node:test';
import { assertStandalonePublicAssets, requiredBuildStaticAssets, requiredPublicAssets } from './lib/standalone-public-assets';

const copyScript = path.resolve('scripts/copy-standalone-catalogs.ts');
const checkScript = path.resolve('scripts/test-standalone-public-assets.ts');
const loader = require.resolve('tsx');
const generated = {
  'chunks/main-current.js': 'globalThis.currentBuild = true;',
  'chunks/app/[slug]/page-current.js': 'globalThis.currentPage = true;',
  'chunks/lazy-current.js': 'export const lazy = true;',
  'chunks/client-only.js': 'export const client = true;',
  'chunks/worker-unlisted.mjs': 'export const worker = true;',
  'css/current.css': '@font-face{font-family:Test;src:url(../media/current.woff2)}',
  'media/current.woff2': Buffer.from([0x77, 0x4f, 0x46, 0x32, 0, 1, 2, 3]),
  'media/unlisted.bin': Buffer.from([0, 255, 1, 254]),
  'build-current/_buildManifest.js': 'self.__BUILD_MANIFEST = {};',
  'build-current/_ssgManifest.js': 'self.__SSG_MANIFEST = new Set();',
};

function fixture(t: TestContext, withBuild = true) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'standalone-static-'));
  const standalone = path.join(root, '.next/standalone');
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const write = (relative: string, value: string | Buffer) => {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, value);
  };
  const json = (relative: string, value: unknown) => write(relative, JSON.stringify(value));
  json('content/events-runtime.json', [{ coverImage: '/events/current.webp' }]);
  json('content/articles-index.json', [{ category: 'News', image: '/images/current.png' }]);
  for (const file of requiredPublicAssets(root)) {
    write(file, 'public asset');
    write(`.next/standalone/${file}`, 'public asset');
  }
  for (const file of ['jobs-runtime', 'events-runtime', 'news-cache', 'articles-index', 'companies-runtime']) json(`public/data/${file}.json`, []);
  if (withBuild) {
    for (const [file, bytes] of Object.entries(generated)) {
      write(`.next/static/${file}`, bytes);
      write(`.next/standalone/.next/static/${file}`, bytes);
    }
    write('.next/BUILD_ID', 'build-current');
    write('.next/standalone/.next/BUILD_ID', 'build-current');
    json('.next/build-manifest.json', { rootMainFiles: ['static/chunks/main-current.js'], lowPriorityFiles: ['static/build-current/_buildManifest.js', 'static/build-current/_ssgManifest.js'], pages: {} });
    json('.next/app-build-manifest.json', { pages: { '/[slug]/page': ['static/chunks/app/[slug]/page-current.js', 'static/css/current.css'] } });
    json('.next/react-loadable-manifest.json', { module: { id: 1, files: ['static/chunks/lazy-current.js'] } });
    json('.next/server/next-font-manifest.json', { app: { layout: ['static/media/current.woff2'] }, pages: {} });
    write('.next/server/app/[slug]/page_client-reference-manifest.js', 'globalThis.__RSC_MANIFEST = {"clientModules":{"module":{"chunks":["1","static/chunks/client-only.js","static/chunks/app/%5Bslug%5D/page-current.js"]}}};');
  }
  return { root, standalone, write, json, check: () => assertStandalonePublicAssets(root, standalone) };
}

function run(script: string, cwd: string) {
  const result = spawnSync(process.execPath, ['--import', loader, script], { cwd, encoding: 'utf8', timeout: 20000 });
  assert.ifError(result.error);
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

test('public-only prebuild fixtures remain valid; a real build includes every generated file', t => {
  fixture(t, false).check();
  const build = fixture(t);
  build.check();
  assert.deepEqual(requiredBuildStaticAssets(build.root), Object.keys(generated).map(file => `.next/static/${file}`).sort());
});

test('good public assets cannot hide a missing standalone JavaScript tree', t => {
  const build = fixture(t);
  fs.rmSync(path.join(build.standalone, '.next/static'), { recursive: true });
  assert.throws(build.check, /Standalone missing \.next\/static\/.*\.js/);
});

for (const file of ['chunks/main-current.js', 'chunks/worker-unlisted.mjs', 'css/current.css', 'media/current.woff2']) {
  test(`missing or same-size corrupt ${file} fails exact-byte validation`, t => {
    const build = fixture(t);
    const target = path.join(build.standalone, '.next/static', file);
    const bytes = fs.readFileSync(target);
    fs.unlinkSync(target);
    assert.throws(build.check, /Standalone missing \.next\/static/);
    const corrupt = Buffer.from(bytes);
    corrupt[corrupt.length - 1] ^= 1;
    fs.writeFileSync(target, corrupt);
    assert.equal(fs.statSync(target).size, bytes.length);
    assert.throws(build.check, /Incomplete standalone asset \(bytes differ\)/);
  });
}

test('same-size public corruption also fails', t => {
  const build = fixture(t, false);
  build.write('.next/standalone/public/favicon.ico', 'public Asset');
  assert.throws(build.check, /Incomplete standalone asset \(bytes differ\): public\/favicon.ico/);
});

for (const file of ['chunks/main-current.js', 'chunks/app/[slug]/page-current.js', 'chunks/lazy-current.js', 'chunks/client-only.js', 'css/current.css', 'media/current.woff2']) {
  test(`manifest reference catches missing source ${file} despite stale packaged bytes`, t => {
    const build = fixture(t);
    fs.unlinkSync(path.join(build.root, '.next/static', file));
    assert.throws(build.check, /Referenced build static asset missing from source/);
    const result = run(copyScript, build.root);
    assert.notEqual(result.status, 0, result.output);
    assert.match(result.output, /Referenced build static asset missing from source/);
  });
}

test('a cleared source tree containing old.js cannot satisfy current build references', t => {
  const build = fixture(t);
  fs.rmSync(path.join(build.root, '.next/static'), { recursive: true });
  build.write('.next/static/chunks/old.js', 'old build');
  assert.throws(build.check, /Referenced build static asset missing from source/);
  const result = run(copyScript, build.root);
  assert.notEqual(result.status, 0, result.output);
  assert.match(result.output, /Referenced build static asset missing from source/);
});

test('missing/empty source static fails even when a previous standalone exists', t => {
  const build = fixture(t);
  fs.rmSync(path.join(build.root, '.next/static'), { recursive: true });
  for (const script of [copyScript, checkScript]) {
    const result = run(script, build.root);
    assert.notEqual(result.status, 0, result.output);
    assert.match(result.output, /Missing generated static directory/);
  }
  fs.mkdirSync(path.join(build.root, '.next/static'));
  assert.throws(build.check, /Generated \.next\/static is empty/);
});

test('build manifests are required, while older Next builds may omit optional manifests', t => {
  const build = fixture(t);
  for (const file of ['app-build-manifest.json', 'react-loadable-manifest.json', 'server/next-font-manifest.json', 'server/app/[slug]/page_client-reference-manifest.js']) fs.unlinkSync(path.join(build.root, '.next', file));
  build.check();
  fs.unlinkSync(path.join(build.root, '.next/build-manifest.json'));
  assert.throws(build.check, /Missing \.next\/build-manifest.json/);
});

test('mixed build IDs and stale destination files are rejected', t => {
  const build = fixture(t);
  build.write('.next/standalone/.next/BUILD_ID', 'build-previous');
  assert.throws(build.check, /bytes differ.*\.next\/BUILD_ID/);
  build.write('.next/standalone/.next/BUILD_ID', 'build-current');
  build.write('.next/standalone/.next/static/chunks/old.js', 'old build');
  assert.throws(build.check, /stale files present/);
});

test('copy CLI replaces only standalone static, including modules, CSS and font bytes', t => {
  const build = fixture(t);
  fs.rmSync(path.join(build.standalone, '.next/static'), { recursive: true });
  build.write('.next/standalone/.next/static/chunks/old.js', 'old build');
  build.write('.next/standalone/server.js', 'server sentinel');
  build.write('.next/cache/do-not-copy', 'cache sentinel');
  const first = run(copyScript, build.root);
  assert.equal(first.status, 0, first.output);
  build.check();
  assert.equal(fs.existsSync(path.join(build.standalone, '.next/static/chunks/old.js')), false);
  assert.equal(fs.existsSync(path.join(build.standalone, '.next/standalone')), false);
  assert.equal(fs.existsSync(path.join(build.standalone, '.next/cache')), false);
  assert.equal(fs.readFileSync(path.join(build.standalone, 'server.js'), 'utf8'), 'server sentinel');
  build.write('.next/static/chunks/main-current.js', 'globalThis.currentBuild = 1234;');
  const second = run(copyScript, build.root);
  assert.equal(second.status, 0, second.output);
  build.check();
  const check = run(checkScript, build.root);
  assert.equal(check.status, 0, check.output);
});

test('CLI skips only when standalone is absent, not when build output is missing', t => {
  const build = fixture(t, false);
  for (const script of [copyScript, checkScript]) {
    const missingBuild = run(script, build.root);
    assert.notEqual(missingBuild.status, 0, missingBuild.output);
    assert.match(missingBuild.output, /Missing generated static directory/);
  }
  fs.rmSync(build.standalone, { recursive: true });
  for (const script of [copyScript, checkScript]) {
    const prebuild = run(script, build.root);
    assert.equal(prebuild.status, 0, prebuild.output);
    assert.match(prebuild.output, /no \.next\/standalone — skip/);
  }
});

test('encoded traversal references and source symlinks fail closed', t => {
  const build = fixture(t);
  build.json('.next/app-build-manifest.json', { pages: { '/': ['static/%2e%2e/server/private.js'] } });
  assert.throws(build.check, /Invalid generated static reference/);
  build.json('.next/app-build-manifest.json', { pages: {} });
  fs.symlinkSync(path.join(build.root, 'public/favicon.ico'), path.join(build.root, '.next/static/linked.ico'));
  assert.throws(build.check, /Generated static asset must be a regular file/);
});

for (const relative of ['.next/standalone', '.next/standalone/.next', '.next/standalone/.next/static']) {
  test(`copy refuses a symlink at ${relative} without deleting outside files`, t => {
    const build = fixture(t);
    build.write('outside/keep', 'untouched');
    fs.rmSync(path.join(build.root, relative), { recursive: true });
    fs.symlinkSync(path.join(build.root, 'outside'), path.join(build.root, relative));
    const result = run(copyScript, build.root);
    assert.notEqual(result.status, 0, result.output);
    assert.match(result.output, /Expected a real build directory/);
    assert.equal(fs.readFileSync(path.join(build.root, 'outside/keep'), 'utf8'), 'untouched');
    assert.deepEqual(fs.readdirSync(path.join(build.root, 'outside')), ['keep']);
  });
}
