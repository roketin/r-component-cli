import fs from 'fs/promises';
import path from 'path';
import os from 'os';

// Use real module (no mocks needed)
const { initCommand } = await import('../src/commands/init.js');

import test from 'node:test';
import assert from 'node:assert/strict';

test('initCommand writes consumer config without $schema or registry', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'rcomp-'));
  try {
    await initCommand({ yes: true, cwd: tmp });

    const cfgPath = path.join(tmp, 'r-component.json');
    const content = await fs.readFile(cfgPath, 'utf8');
    const cfg = JSON.parse(content);

    assert.ok(cfg.baseDir);
    assert.ok(cfg.componentsDir);
    // Should not include registry or $schema
    assert.equal(cfg.registry, undefined);
    assert.equal(cfg.$schema, undefined);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
});
