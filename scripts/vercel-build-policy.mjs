const INTERNAL_ONLY_PREFIXES = [
  '.github/',
  'tests/',
  'scripts/radar/',
];

const INTERNAL_ONLY_FILES = new Set([
  'README.md',
]);

export function normalizeRepoPath(value = '') {
  return String(value).trim().replace(/^\.\//, '').replace(/\\/g, '/');
}

export function isInternalOnlyPath(value) {
  const path = normalizeRepoPath(value);
  if (!path) return false;
  if (INTERNAL_ONLY_FILES.has(path)) return true;
  return INTERNAL_ONLY_PREFIXES.some((prefix) => path.startsWith(prefix));
}

export function shouldSkipVercelBuild(changedFiles = []) {
  if (!Array.isArray(changedFiles) || changedFiles.length === 0) return false;
  return changedFiles.every(isInternalOnlyPath);
}

export const internalOnlyBuildPaths = Object.freeze({
  prefixes: [...INTERNAL_ONLY_PREFIXES],
  files: [...INTERNAL_ONLY_FILES],
});
