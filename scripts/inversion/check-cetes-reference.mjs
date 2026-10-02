import { appendFile } from 'node:fs/promises';
import { CETES_REFERENCE } from '../../src/data/cetes-reference.js';
import { compareCetesSnapshots, parseCetesOfficialTable } from './cetes-reference-lib.mjs';

const response = await fetch(CETES_REFERENCE.sourceUrl, { headers:{ 'user-agent':'MiLana-reference-check/1.0' } });
if (!response.ok) throw new Error(`Fuente CETES respondió HTTP ${response.status}`);
const remote = parseCetesOfficialTable(await response.text());
const comparison = compareCetesSnapshots(CETES_REFERENCE, remote);
const payload = {
  checkedAt: new Date().toISOString(),
  sourceUrl: CETES_REFERENCE.sourceUrl,
  currentSourceDate: CETES_REFERENCE.sourceDate,
  remoteSourceDate: remote.sourceDate,
  changed: comparison.changed,
  changes: comparison.changes,
  remote,
};
console.log(JSON.stringify(payload, null, 2));

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `changed=${comparison.changed ? 'true' : 'false'}\n`);
  await appendFile(process.env.GITHUB_OUTPUT, `remote_date=${remote.sourceDate}\n`);
  const compact = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
  await appendFile(process.env.GITHUB_OUTPUT, `payload_b64=${compact}\n`);
}
