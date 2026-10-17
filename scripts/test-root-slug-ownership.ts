import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import { Children, isValidElement, type ReactNode } from 'react';
import type { Job } from '../src/types';
import archiveJson from '../content/legacy-slugs-archive.json';
import runtimeJobs from '../content/jobs-runtime.json';
import { classifySlug } from '../src/lib/slug-classifier';
import { hasLiveJobRootOwner } from '../src/lib/job-root-ownership';
import { findLiveJobForArchived, resolveJobSlug, type ArchivedSlugRecord } from '../src/lib/job-guides';
import { resolveOgPreviewMeta } from '../src/lib/og-preview';
import { getTerm } from '../src/lib/glossary';
import { isExpiredJobPath } from '../src/lib/job-age-path';
import { isRemovedJobPath } from '../src/lib/removed-job-path';

const archive = archiveJson as Record<string, ArchivedSlugRecord>;
const origin = 'https://hashtagweb3.com';

async function rootPageModule() {
  const require = createRequire(import.meta.url);
  const original = require.extensions['.css'];
  // Node executes the server entrypoint here without Next's CSS loader.
  require.extensions['.css'] = () => {};
  try { return await import('../src/app/[slug]/page'); }
  finally {
    if (original) require.extensions['.css'] = original;
    else delete require.extensions['.css'];
  }
}

function pageSchemas(node: ReactNode): unknown[] {
  const schemas: unknown[] = [];
  Children.forEach(node, child => {
    if (!isValidElement<{ children?: ReactNode; data?: unknown }>(child)) return;
    if (child.props.data) schemas.push(child.props.data);
    schemas.push(...pageSchemas(child.props.children));
  });
  return schemas;
}

test('web3 and token render glossary pages and matching previews without reviving their archived jobs', async () => {
  const before = JSON.stringify({ archive, runtimeJobs });
  const { default: Page, generateMetadata } = await rootPageModule();
  for (const slug of ['web3', 'token']) {
    assert.ok(archive[slug].newSlug);
    assert.equal(archive[slug].id, undefined);
    assert.equal(archive[slug].link, undefined);
    assert.equal((await resolveJobSlug(slug)).kind, 'unknown');
    assert.equal(classifySlug(slug), 'glossary');
    assert.equal(classifySlug(` ${slug.toUpperCase()} `), 'glossary');
    assert.equal(isExpiredJobPath(`/${slug}`), false);
    assert.equal(isRemovedJobPath(`/${slug}`), false);
    const term = await getTerm(slug);
    assert.ok(term);
    const args = { params: Promise.resolve({ slug }) };
    const metadata = await generateMetadata(args);
    const preview = await resolveOgPreviewMeta(`/${slug}`);
    assert.equal(metadata.alternates?.canonical, `${origin}/${slug}`);
    assert.equal(preview.canonicalUrl, `${origin}/${slug}`);
    assert.equal(preview.title, metadata.openGraph?.title);
    assert.equal(preview.description, metadata.description);
    assert.equal(preview.title, `${term.term} - Web3 Glossary`);
    const page = await Page(args);
    assert.ok(isValidElement(page));
    const tree = JSON.stringify(pageSchemas(page));
    assert.ok(tree.includes('DefinedTerm'), `${slug}: human page must contain glossary structured data`);
    assert.ok(!tree.includes('JobPosting'), `${slug}: archived job must not resurface`);
  }
  assert.equal(JSON.stringify({ archive, runtimeJobs }), before);
});

test('an identity-verified active historical alias still resolves and redirects to its current job', async () => {
  const candidate = Object.entries(archive).find(([slug, record]) => {
    if (classifySlug(slug) !== 'job' || isExpiredJobPath(`/${slug}`) || isRemovedJobPath(`/${slug}`)) return false;
    const job = findLiveJobForArchived(record, runtimeJobs as Job[]);
    return job?.slug && job.slug !== slug;
  });
  assert.ok(candidate);
  const [slug, record] = candidate;
  const job = findLiveJobForArchived(record, runtimeJobs as Job[])!;
  assert.equal(classifySlug(slug), 'job');
  assert.equal(hasLiveJobRootOwner(slug, record, runtimeJobs as Job[]), true);
  const resolved = await resolveJobSlug(slug);
  assert.equal(resolved.canonicalSlug, job.slug);
  assert.equal(resolved.job?.id, job.id);
  assert.equal(resolved.job?.date, job.date);
  const preview = await resolveOgPreviewMeta(`/${slug}`);
  assert.equal(preview.canonicalUrl, `${origin}/${job.slug}`);
  const { default: Page, generateMetadata } = await rootPageModule();
  const args = { params: Promise.resolve({ slug }) };
  assert.equal((await generateMetadata(args)).alternates?.canonical, preview.canonicalUrl);
  await assert.rejects(() => Page(args), error => error instanceof Error && 'digest' in error
    && typeof error.digest === 'string' && error.digest.includes(`;/${job.slug};308;`));
});

test('a content collision yields to a verified current job, never a bare pointer or unrelated posting', () => {
  const job: Job = {
    slug: 'current-job', id: 'posting-id', company: 'Original Employer', title: 'Engineer',
    link: 'https://example.com/careers/posting-id', source: 'test', date: new Date(Date.now() - 86400000).toISOString(),
  };
  const old: ArchivedSlugRecord = { id: job.id, company: job.company, link: `${job.link}?utm_source=saved`, newSlug: job.slug };
  const before = JSON.stringify({ job, old });
  assert.equal(hasLiveJobRootOwner('web3', old, [job]), true);
  assert.equal(hasLiveJobRootOwner('web3', { newSlug: job.slug }, [job]), false);
  assert.equal(hasLiveJobRootOwner('web3', { ...old, link: 'https://example.com/careers/another-posting' }, [job]), false);
  assert.equal(hasLiveJobRootOwner('web3', { ...old, retiredReason: 'application-closed' }, [job]), false);
  assert.equal(hasLiveJobRootOwner('web3', { id: job.id, company: job.company }, [job]), true);
  assert.equal(hasLiveJobRootOwner('web3', { id: job.id, company: 'Another Employer' }, [job]), false);
  assert.equal(hasLiveJobRootOwner('web3', { newSlug: 'unrelated' }, [{ ...job, slug: 'web3' }]), true);
  assert.equal(hasLiveJobRootOwner('web3', { newSlug: 'unrelated' }, [{ ...job, id: 'web3' }]), true);
  for (const ineligible of [
    { ...job, active: false }, { ...job, dateVerified: false },
    { ...job, date: new Date(Date.now() - 31 * 86400000).toISOString() },
    { ...job, retiredReason: 'application-closed' },
    { ...job, source: 'Breezy: employer', link: 'https://employer.breezy.hr/p/posting-id' },
  ]) assert.equal(hasLiveJobRootOwner('web3', old, [{ ...ineligible, slug: 'web3' }]), false);
  assert.equal(JSON.stringify({ job, old }), before);
});
