#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const pendingDir = process.env.CENTRAMIND_CLOSEOUT_DIR
  || path.join(os.homedir(), '.config', 'centramind', 'closeouts', 'pending');
const input = await new Promise((resolve) => {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { data += chunk; });
  process.stdin.on('end', () => resolve(data));
});

let raw;
try { raw = JSON.parse(input); } catch { throw new Error('pending closeout input must be valid JSON'); }
const closeoutId = typeof raw.closeout_id === 'string' ? raw.closeout_id.trim() : '';
if (!/^[A-Za-z0-9._:-]{8,200}$/.test(closeoutId)) {
  throw new Error('closeout_id is required and must be a safe filename');
}

const scrub = (value) => {
  if (typeof value !== 'string') return value;
  return value
    .replace(/(?:Bearer\s+|cmk_|sk-)[A-Za-z0-9._~:+/-]{12,}/gi, '[REDACTED_SECRET]')
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_SECRET]')
    .replace(/\bsb_secret_[A-Za-z0-9_-]{12,}\b/gi, '[REDACTED_SECRET]')
    .slice(0, 2000);
};
const list = (value) => Array.isArray(value)
  ? value.filter((item) => typeof item === 'string').slice(0, 12).map(scrub)
  : [];

const manifest = {
  version: 1,
  closeout_id: closeoutId,
  created_at: new Date().toISOString(),
  instance: scrub(raw.instance || ''),
  repo: scrub(raw.repo || ''),
  branch: scrub(raw.branch || ''),
  operations: Array.isArray(raw.operations) ? raw.operations.slice(0, 20).map((op) => ({
    type: scrub(op?.type || ''),
    id: scrub(op?.id || ''),
    intent: scrub(op?.intent || ''),
  })) : [],
  lesson_refs: list(raw.lesson_refs),
  event: {
    outcome: scrub(raw.event?.outcome || 'partial'),
    summary: scrub(raw.event?.summary || ''),
    boarded_task_ids: list(raw.event?.boarded_task_ids),
    lesson_refs: list(raw.event?.lesson_refs),
    bottlenecks: list(raw.event?.bottlenecks),
    improvements: list(raw.event?.improvements),
    pending_writes: list(raw.event?.pending_writes),
  },
};

fs.mkdirSync(pendingDir, { recursive: true, mode: 0o700 });
const target = path.join(pendingDir, `${closeoutId}.json`);
const temp = `${target}.${process.pid}.tmp`;
fs.writeFileSync(temp, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
fs.renameSync(temp, target);
console.log(target);
