#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import type { Job } from '../src/types';
import { assignJobSlugsAndSyncLegacyArchive, getJobContentKey } from '../src/lib/job-slugs';
import { loadPublishedRootSlugsSync, loadReservedRootSlugsSync } from '../src/lib/reserved-root-slugs';
import { loadJobLegacyArchive, writeJobLegacyArchive } from './lib/job-slug-assignment';
import { sanitizeJobDescriptionHtml } from '../src/lib/sanitize-html';
import {
  buildJobDescriptionAliases,
  readJobDescriptionStore,
  writeJobDescriptionStore,
} from './lib/job-description-store';
import sharp from 'sharp';

async function main() {
  const root = process.cwd();

  // 1. Ensure logo exists
  const logoPath = path.join(root, 'public/logo/companies/ckba.png');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" rx="104" fill="#0e0c16"/>
    <g transform="translate(114, 110) scale(1)">
      <svg viewBox="0 0 282.93 292.88" width="283" height="293" fill="#8b7cff">
        <g id="Layer_1-2">
          <path d="M0,0v138.88h133.86V0H0ZM101.52,30.61v11.97h-12.13v-6.29h-44v63.93h44v-6.29h12.13v12.8l-.59.59-4.33,4.33-.59.59h-57.24l-.58-.56-4.46-4.33-.61-.59V29.76l.61-.59,4.46-4.33.58-.56h57.25l.59.59,4.33,4.33.59.59v.83Z"/>
          <path d="M149.07,0v138.88h133.86V0h-133.86ZM245.45,113.2h-12.2l-.58-.53-37.95-35.22v35.76h-12.26V25.27h12.26v35.86l37.95-35.33.58-.54h17.28l-3.73,3.46-43.6,40.55,43.6,40.45,3.74,3.47h-5.1Z"/>
          <polygon points="44.99 215.07 69.61 215.07 88.99 200.59 88.99 191.27 44.99 191.27 44.99 215.07"/>
          <polygon points="44.99 226.94 44.99 255.2 88.99 255.2 88.99 241.42 69.61 226.94 44.99 226.94"/>
          <path d="M0,154v138.88h133.86v-138.88H0ZM101.13,185.59v20.68l-.81.6-18.96,14.01,18.97,14.26.8.6v25.96l-.59.59-4.33,4.33-.59.59h-57.24l-.58-.56-4.46-4.33-.61-.59v-76.97l.61-.59,4.46-4.33.58-.56h57.25l.59.59,4.33,4.33.59.59v.83Z"/>
          <path d="M149.07,154v138.88h133.86v-138.88h-133.86ZM252.86,267.2h-9.78l-.49-1.29-6.73-17.85h-39.71l-6.73,17.85-.49,1.29h-12.68l1.03-2.71,31.87-83.93.49-1.29h12.99l.49,1.3,31.61,83.93,1.02,2.7h-2.89Z"/>
          <polygon points="200.67 236.05 231.34 236.05 216 195.39 200.67 236.05"/>
        </g>
      </svg>
    </g>
  </svg>`;
  await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(logoPath);
  console.log('✓ Ensured company logo at', logoPath);

  // 2. Company branding
  const brandingPath = path.join(root, 'content/company-branding.json');
  const branding = JSON.parse(fs.readFileSync(brandingPath, 'utf8'));
  branding['ckba'] = {
    website: 'https://www.ckba.build',
    logo: '/logo/companies/ckba.png',
  };
  fs.writeFileSync(brandingPath, `${JSON.stringify(branding, null, 2)}\n`);

  // 3. Company socials
  const socialsPath = path.join(root, 'content/company-socials.json');
  const socials = JSON.parse(fs.readFileSync(socialsPath, 'utf8'));
  socials['ckba'] = {
    website: 'https://www.ckba.build',
    twitter: 'https://x.com/ckba_build',
    linkedin: 'https://www.linkedin.com/company/common-knowledge-base-association',
  };
  fs.writeFileSync(socialsPath, `${JSON.stringify(socials, null, 2)}\n`);

  // 4. Company editorial
  const editorialPath = path.join(root, 'content/company-profile-editorial.json');
  const editorial = JSON.parse(fs.readFileSync(editorialPath, 'utf8'));
  editorial['ckba'] =
    'CKBA (Common Knowledge Base Association) is a Swiss membership-based, non-profit association governed by its contributors, dedicated to supporting the development, open-source infrastructure, and ecosystem growth of the CKB blockchain.';
  fs.writeFileSync(editorialPath, `${JSON.stringify(editorial, null, 2)}\n`);

  // 5. Job description HTML
  const rawDesc = `<p><strong>Organization:</strong> Common Knowledge Base Association (CKBA)<br />
<strong>Location:</strong> Remote / Global (Asia, Europe, or US West Coast preferred, with sufficient working-hour overlap with our Asia-based team)<br />
<strong>Reports to:</strong> Operations Office</p>

<h3>About CKBA</h3>
<p>CKBA is a Swiss membership-based, non-profit association governed by its contributors, dedicated to supporting the development and growth of the CKB ecosystem.</p>

<h3>About the Role</h3>
<p>We are looking for a Payment Channel Team Lead (Fiber) to drive the development, growth, and adoption of Fiber, an open-source payment-channel network built on the CKB blockchain.</p>
<p>In this role, you will bring together technical judgment, product and market insight, and team leadership to set direction, identify opportunities, and drive results. A key part of your work will be understanding the needs of developers and partners and translating them into clear, actionable engineering requirements.</p>
<p>You will lead a small team spanning engineering, developer relations, and ecosystem development, with the authority to set priorities and allocate resources within CKBA's approved budgets and governance framework.</p>
<p>You will work closely with the Engineering Lead, who is responsible for technical design, engineering quality, and release readiness. Together, you will align on delivery scope, milestones, and external commitments, sharing accountability for delivering on those commitments.</p>

<h3>Key Responsibilities</h3>
<ul>
  <li><strong>Strategy and execution:</strong> Own Fiber's strategy, roadmap, and priorities, balancing adoption opportunities with technical feasibility and team capacity.</li>
  <li><strong>Technical judgment:</strong> Understand and communicate Fiber's architecture, capabilities, and limitations, and work with engineering to evaluate technical options, costs, risks, and trade-offs.</li>
  <li><strong>Requirements discovery:</strong> Understand partner workflows, user needs, integration constraints, and operational responsibilities, and translate findings into actionable engineering requirements.</li>
  <li><strong>Hands-on investigation:</strong> Work on integrations and build small proofs of concept to validate assumptions and identify opportunities to improve documentation, tooling, and developer workflows.</li>
  <li><strong>Team leadership:</strong> Set objectives, allocate resources, develop team capabilities, and take ownership of overall project outcomes.</li>
  <li><strong>Ecosystem growth:</strong> Build relationships with developers and partners, support real-world integrations, and encourage broader community participation and contributions.</li>
</ul>

<h3>Qualifications</h3>
<ul>
  <li>Strong technical understanding of payment channels, blockchain protocols, or related infrastructure, with the ability to evaluate architectural decisions and engineering trade-offs.</li>
  <li>Experience with blockchain infrastructure, Layer 2 scaling solutions, or payment-channel technologies. Experience with the Lightning Network or similar architectures is particularly valuable.</li>
  <li>Strong product judgment, communication, and collaborative decision-making skills, with an understanding of developer adoption and ecosystem growth.</li>
  <li>Ability to work on hands-on integrations and investigate technical issues, using AI-assisted tools where helpful.</li>
  <li>Experience translating user or partner needs into clear, well-scoped engineering requirements.</li>
  <li>Experience leading technical teams or cross-functional initiatives, ideally within open-source or developer-focused ecosystems.</li>
  <li>Experience supporting external developers or partners in integrating and adopting protocols, developer platforms, or open-source infrastructure.</li>
</ul>

<h3>What Success Looks Like</h3>
<p>A realistic and actionable roadmap, smoother integrations and a better developer experience, growing adoption and community contributions, and a team with clear ownership and accountability.</p>

<h3>How to Apply</h3>
<p>Interested? Send your application to <a href="mailto:join@ckba.build">join@ckba.build</a> with:</p>
<ul>
  <li>A brief introduction about yourself and why this role interests you</li>
  <li>Your resume or LinkedIn profile</li>
  <li>Links to your GitHub, open-source contributions, or projects you've built</li>
</ul>

<h3>Perks & Work Environment</h3>
<ul>
  <li><strong>Remote & Flexible</strong> — Work from anywhere with a globally distributed team.</li>
  <li><strong>Flexible Time Off</strong> — 15 days of time off + public holidays based on your location.</li>
  <li><strong>AI & Tooling Support</strong> — Budget for AI and productivity tools that help you work better.</li>
  <li><strong>In-person Gatherings</strong> — Opportunities to meet and build together through team gatherings and ecosystem events.</li>
</ul>`;

  const cleanDesc = sanitizeJobDescriptionHtml(rawDesc, 'CKBA');

  // 6. Ingest Job into jobs-cache.json
  const cachePath = path.join(root, 'content/jobs-cache.json');
  const allJobs: Job[] = JSON.parse(fs.readFileSync(cachePath, 'utf8'));

  // Remove previous entry if any
  const filtered = allJobs.filter(
    (j) => j.id !== 'ckba-payment-channel-team-lead' && j.link !== 'https://www.ckba.build/careers/payment-channel-team-lead' && !(j.company === 'CKBA' && j.title === 'Payment Channel Team Lead')
  );

  const jobRow: Job = {
    id: 'ckba-payment-channel-team-lead',
    title: 'Payment Channel Team Lead',
    company: 'CKBA',
    link: 'mailto:join@ckba.build?subject=Application%20for%20Payment%20Channel%20Team%20Lead',
    date: '2026-11-06T00:00:00.000Z',
    dateVerified: true,
    dateSource: 'CKBA Official Job Description',
    source: 'CKBA [ckba]',
    location: 'Remote',
    department: 'Engineering',
    active: true,
  };

  const legacyArchive = loadJobLegacyArchive();
  const reservedSlugs = loadReservedRootSlugsSync();
  const publishedSlugs = loadPublishedRootSlugsSync();

  // Add job
  const combined = [jobRow, ...filtered];
  assignJobSlugsAndSyncLegacyArchive(combined, legacyArchive, reservedSlugs, publishedSlugs);
  writeJobLegacyArchive(legacyArchive);

  fs.writeFileSync(cachePath, `${JSON.stringify(combined, null, 2)}\n`);
  console.log(`✓ Added job to jobs-cache.json (slug: /${jobRow.slug})`);

  // 7. Store description in shards
  const store = readJobDescriptionStore(root);
  const descriptions = { ...store.descriptions };
  const contentKey = getJobContentKey(jobRow);
  descriptions[contentKey] = cleanDesc;

  writeJobDescriptionStore(
    {
      descriptions,
      aliases: { ...store.aliases, ...buildJobDescriptionAliases(combined, descriptions) },
    },
    root
  );
  console.log(`✓ Stored job description for key ${contentKey}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
