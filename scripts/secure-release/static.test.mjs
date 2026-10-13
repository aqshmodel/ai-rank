import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';

test('public files load; code, database, env and repository metadata remain private', async () => {
  const env = { PATH: process.env.PATH, PORT: '39333', NODE_ENV: 'test', ADMIN_PASSWORD: 'synthetic-only' };
  const child = spawn(process.execPath, ['server.js'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = ''; child.stderr.on('data', x => { logs += x; });
  try {
    let ready = false;
    for (let i = 0; i < 80; i++) {
      if (child.exitCode !== null) throw new Error('server exited: ' + logs);
      try { ready = (await fetch('http://127.0.0.1:39333/')).status === 200; } catch {}
      if (ready) break;
      await new Promise(r => setTimeout(r, 100));
    }
    assert.ok(ready, logs);
    for (const path of ['/', '/privacy.html', '/style.css', '/i18n.js']) {
      assert.equal((await fetch('http://127.0.0.1:39333' + path)).status, 200, path);
    }
    for (const path of ['/server.js', '/package.json', '/package-lock.json', '/schema.sql', '/.env', '/.git/config', '/api/_db.js', '/routes/admin.js', '/scripts/secure-release/static.test.mjs']) {
      assert.equal((await fetch('http://127.0.0.1:39333' + path)).status, 404, path);
    }
  } finally { child.kill('SIGTERM'); }
});
