import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import type { Job } from '../../src/types';
import { jobAgeExclusionReason, parseJobPostingDate } from '../../src/lib/job-age-policy.mjs';
import { getJobIdentity } from '../../src/lib/job-slugs';
import { hasRequiredJobDateProvenance } from '../../src/lib/job-source-date';

const FILES = ['content/jobs-cache.json', 'content/jobs-runtime.json'] as const;
const MAX_BUILD_AGE_MS = 2 * 60 * 60 * 1000;
export const JOB_AGE_BUILD_SNAPSHOT_ENV = 'JOB_AGE_BUILD_SNAPSHOT';
export const JOB_AGE_BUILD_SNAPSHOT_FILE = '.cache/prebuild-job-age/snapshot.json';
type Build = { version: 1; root: string; attemptId: string; startedAt: number };
type Artifact = { file: typeof FILES[number]; sha256: string; count: number };
type Capture = Build & { cutoff: number; capturedAt: number; artifacts: Artifact[] };
type Snapshot = Capture & { completedAt: number; state: 'ready' | 'claimed' };
const sha256 = (body: Buffer | string) => createHash('sha256').update(body).digest('hex');
const snapshotPath = (root: string) => path.join(root, JOB_AGE_BUILD_SNAPSHOT_FILE);

function readArtifacts(root: string) {
  return FILES.map(file => {
    const body = fs.readFileSync(path.join(root, file));
    const jobs: Job[] = JSON.parse(body.toString());
    if (!Array.isArray(jobs)) throw new Error(`Invalid job artifact: ${file}`);
    return { file, jobs, sha256: sha256(body), count: jobs.length };
  });
}

function validateJobs(artifacts: ReturnType<typeof readArtifacts>, cutoff: number) {
  for (const { file, jobs } of artifacts) {
    for (const job of jobs) {
      const reason = jobAgeExclusionReason(job, cutoff)
        || (!hasRequiredJobDateProvenance(job) ? 'unverified-primary-date' : null)
        || (/updated|fetched|ingest|discovery|discovered/i.test(job.dateSource || '') ? 'non-posting-date' : null);
      if (reason) throw new Error(`${file}: ${job?.slug || job?.id || '<unknown>'} is ${reason} at ${new Date(cutoff).toISOString()} (original date: ${job?.date || '<missing>'})`);
    }
  }
  const source = new Map(artifacts[0].jobs.map(job => [getJobIdentity(job), job]));
  for (const job of artifacts[1].jobs) {
    const original = source.get(getJobIdentity(job));
    if (!original || parseJobPostingDate(original.date) !== parseJobPostingDate(job.date)) {
      throw new Error(`Runtime posting does not match its original source date: ${job.slug || job.id}`);
    }
  }
}

function verifyCapture(capture: Capture, root: string, completedAt: number, now = Date.now()) {
  const times = [capture.startedAt, capture.cutoff, capture.capturedAt, completedAt, now];
  if (capture.version !== 1 || capture.root !== path.resolve(root) || typeof capture.attemptId !== 'string'
    || !/^[a-f0-9-]{36}$/.test(capture.attemptId)
    || times.some(time => !Number.isSafeInteger(time) || time < 0)
    || times.some((time, index) => index > 0 && time < times[index - 1])
    || now - capture.startedAt > MAX_BUILD_AGE_MS) {
    throw new Error('Invalid, future or stale job-age build snapshot');
  }
  const artifacts = readArtifacts(root);
  if (!Array.isArray(capture.artifacts) || capture.artifacts.length !== FILES.length
    || artifacts.some((artifact, index) => {
      const expected = capture.artifacts[index];
      return expected?.file !== artifact.file || expected.sha256 !== artifact.sha256 || expected.count !== artifact.count;
    })) throw new Error('Job-age build snapshot does not match the current artifact bytes');
  validateJobs(artifacts, capture.cutoff);
  return artifacts;
}

export function beginJobAgeBuildSnapshot(root = process.cwd()): Build {
  fs.rmSync(snapshotPath(root), { force: true });
  return { version: 1, root: path.resolve(root), attemptId: randomUUID(), startedAt: Date.now() };
}

export function hasExpiredJobArtifacts(root = process.cwd(), now = Date.now()): boolean {
  return FILES.some(file => {
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute)) return false;
    const jobs: Job[] = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    if (!Array.isArray(jobs)) throw new Error(`Invalid job artifact: ${file}`);
    return jobs.some(job => jobAgeExclusionReason(job, now) === 'expired');
  });
}

export function captureJobAgeBuildSnapshot(build: Build, cutoff: number, root = process.cwd()): Capture {
  const artifacts = readArtifacts(root);
  const capture: Capture = {
    ...build, cutoff, capturedAt: Date.now(),
    artifacts: artifacts.map(({ file, sha256, count }) => ({ file, sha256, count })),
  };
  verifyCapture(capture, root, capture.capturedAt);
  return capture;
}

export function completeJobAgeBuildSnapshot(capture: Capture | undefined, root = process.cwd()): void {
  if (!capture) throw new Error('The jobs-generation stage did not validate its artifacts');
  const completedAt = Date.now();
  verifyCapture(capture, root, completedAt);
  const snapshot: Snapshot = { ...capture, completedAt, state: 'ready' };
  fs.mkdirSync(path.dirname(snapshotPath(root)), { recursive: true });
  fs.writeFileSync(snapshotPath(root), `${JSON.stringify(snapshot)}\n`);
}

export function withJobAgeBuildSnapshot<T>(gate: (authorization: string) => T, root = process.cwd()): T {
  const file = snapshotPath(root);
  const snapshot: Snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (snapshot.state !== 'ready') throw new Error('Job-age build snapshot has already been claimed');
  try {
    verifyCapture(snapshot, root, snapshot.completedAt);
    const body = `${JSON.stringify({ ...snapshot, state: 'claimed' })}\n`;
    fs.writeFileSync(file, body);
    return gate(sha256(body));
  } finally { fs.rmSync(file, { force: true }); }
}

export function readValidatedJobAgeArtifacts(root = process.cwd(), authorization: string | null = process.env[JOB_AGE_BUILD_SNAPSHOT_ENV] || null) {
  let artifacts: ReturnType<typeof readArtifacts>;
  let cutoff = Date.now();
  if (authorization !== null) {
    const body = fs.readFileSync(snapshotPath(root));
    if (!/^[a-f0-9]{64}$/.test(authorization) || sha256(body) !== authorization) throw new Error('Invalid job-age snapshot authorization');
    const snapshot: Snapshot = JSON.parse(body.toString());
    if (snapshot.state !== 'claimed') throw new Error('The deployment gate has not claimed this job-age snapshot');
    artifacts = verifyCapture(snapshot, root, snapshot.completedAt, cutoff);
    cutoff = snapshot.cutoff;
  } else {
    artifacts = readArtifacts(root);
    validateJobs(artifacts, cutoff);
  }
  return { cache: artifacts[0].jobs, runtime: artifacts[1].jobs, validatedAt: cutoff };
}
