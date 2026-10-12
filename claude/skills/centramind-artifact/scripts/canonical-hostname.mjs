#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const ARTIFACT_DOMAIN = 'artifacts.eternium.ai';
const MAX_LABEL_LENGTH = 63;
const HASH_LENGTH = 8;

export function normalizeLabelPart(value) {
  if (typeof value !== 'string') return '';

  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function stableSuffix(stableId) {
  if (typeof stableId !== 'string' || stableId.trim() === '') {
    throw new Error('A non-empty stableId is required for collisions or truncated labels.');
  }

  return createHash('sha256').update(stableId.trim()).digest('hex').slice(0, HASH_LENGTH);
}

export function createCanonicalArtifactHostname({ business, artifact, stableId, collision = false }) {
  const businessLabel = normalizeLabelPart(business);
  const artifactLabel = normalizeLabelPart(artifact);

  if (!businessLabel || !artifactLabel) {
    throw new Error('Business and artifact must each contain at least one ASCII letter or digit.');
  }

  const base = `${businessLabel}-${artifactLabel}`;
  const needsSuffix = collision || base.length > MAX_LABEL_LENGTH;
  let label = base;

  if (needsSuffix) {
    const suffix = stableSuffix(stableId);
    const maxBaseLength = MAX_LABEL_LENGTH - HASH_LENGTH - 1;
    const truncatedBase = base.slice(0, maxBaseLength).replace(/-+$/g, '');
    label = `${truncatedBase}-${suffix}`;
  }

  return `${label}.${ARTIFACT_DOMAIN}`;
}

function parseArgs(argv) {
  const values = {};

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--collision') {
      values.collision = true;
      continue;
    }

    if (!argument.startsWith('--')) {
      throw new Error(`Unexpected argument: ${argument}`);
    }

    const key = argument.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${argument}`);
    }
    values[key] = value;
    index += 1;
  }

  return values;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const options = parseArgs(process.argv.slice(2));
    console.log(createCanonicalArtifactHostname(options));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
