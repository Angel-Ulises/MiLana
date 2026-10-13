import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const hayFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0;

test('armar-reel produce 1080×1920 con audio y cierre de crédito', { skip: !hayFfmpeg && 'ffmpeg no disponible' }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'reel-'));
  const fuente = join(dir, 'h.mp4');
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=s=640x360:d=2:r=30', '-c:v', 'libx264', fuente]);
  const salida = join(dir, 'r.mp4');
  execFileSync('bash', ['herramientas/reels/armar-reel.sh', fuente, 'Título: con "comillas" y acentos', 'Autoría Ñ', salida]);
  assert.ok(existsSync(salida));
  const info = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', salida], { encoding: 'utf8' });
  const { streams, format } = JSON.parse(info);
  const video = streams.find((s) => s.codec_type === 'video');
  assert.equal(video.width, 1080);
  assert.equal(video.height, 1920);
  assert.ok(streams.some((s) => s.codec_type === 'audio'), 'lleva pista de audio');
  assert.ok(Math.abs(Number(format.duration) - 4.5) < 0.3, `dura clip + cierre: ${format.duration}`);
});

test('rechaza títulos demasiado largos para leerse en el celular', { skip: !hayFfmpeg && 'ffmpeg no disponible' }, () => {
  const r = spawnSync('bash', ['herramientas/reels/armar-reel.sh', 'package.json', 'x'.repeat(71), 'Autor']);
  assert.notEqual(r.status, 0);
});
