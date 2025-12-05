import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Stub global.fetch to respond to registry, component json and file requests
global.fetch = async (url) => {
  const u = String(url);
  if (u.endsWith('index.json')) {
    return { ok: true, json: async () => ({ components: ['r-btn'], baseUrl: 'https://raw', componentsUrl: 'https://raw/components' }) };
  }
  if (u.endsWith('/components/r-btn.json')) {
    return { ok: true, json: async () => ({ name: 'r-btn', files: [ { path: 'src/modules/app/components/base/r-btn.tsx', type: 'registry:component', target: 'src/modules/app/components/base/r-btn.tsx' }, { path: 'src/modules/app/libs/utils.ts', type: 'registry:lib', target: 'src/modules/app/libs/utils.ts' } ], dependencies: ['use-debounce'] }) };
  }
  // file fetches
  if (u.includes('r-btn.tsx') || u.includes('utils.ts')) {
    return { ok: true, text: async () => `// content for ${u}` };
  }
  return { ok: false, status: 404 };
};

const { addCommand } = await import('../src/commands/add.js');

test('addCommand installs component files into target project', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'rcomp-'));
  try {
    // create a consumer config file (init would normally do this)
    const cfg = {
      baseDir: 'src/components',
      componentsDir: 'base',
      libsDir: 'libs',
      typescript: false,
      aliases: { components: '@/components', libs: '@/libs' },
    };
    await fs.writeFile(path.join(tmp, 'r-component.json'), JSON.stringify(cfg, null, 2));

    await addCommand(['r-btn'], { yes: true, overwrite: true, cwd: tmp });

    const compPath = path.join(tmp, 'src', 'components', 'base', 'r-btn.tsx');
    const libPath = path.join(tmp, 'libs', 'utils.ts');

    // Ensure files were created
    const compExists = await fs.stat(compPath).then(() => true).catch(() => false);
    const libExists = await fs.stat(libPath).then(() => true).catch(() => false);

    assert.equal(compExists, true);
    assert.equal(libExists, true);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
});

