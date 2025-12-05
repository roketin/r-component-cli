import test from 'node:test';
import assert from 'node:assert/strict';

// Stub global.fetch so fetchRegistry returns known index
global.fetch = async (url) => {
  return {
    ok: true,
    json: async () => ({ components: ['r-a', 'r-b'] }),
  };
};

const { listCommand } = await import('../src/commands/list.js');

test('listCommand prints json when --json option passed', async () => {
  const logs = [];
  const orig = console.log;
  console.log = (...args) => logs.push(args.join(' '));
  try {
    await listCommand({ json: true });
    const found = logs.some((l) => l.includes('r-a'));
    assert.ok(found, 'Expected r-a to appear in output');
  } finally {
    console.log = orig;
  }
});
