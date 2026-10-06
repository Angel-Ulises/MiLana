import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function browserReady(t, chrome, { run = spawnSync, ci = process.env.CI === 'true' } = {}) {
  const unavailable = (reason) => {
    if (ci) throw new Error(reason);
    t.skip(reason);
    return false;
  };
  if (!chrome) return unavailable('Chrome/Chromium no instalado en el runner');
  const profile = mkdtempSync(join(tmpdir(), 'milana-probe-'));
  try {
    const result = run(chrome, ['--headless=new', '--no-sandbox', '--disable-gpu', `--user-data-dir=${profile}`, '--dump-dom', 'about:blank'], {
      encoding: 'utf8', timeout: 8000, killSignal: 'SIGKILL', env: process.env,
    });
    if (result.status !== 0) return unavailable(`Chrome probe failed (${chrome}, status=${result.status}, ${result.error?.message || ''}): ${String(result.stderr || '').slice(-2000)}`);
    return true;
  } finally {
    rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}
