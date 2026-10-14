import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { createHash } from 'node:crypto';
import { normalizeOfficialCompanySocial } from '../src/lib/company-socials';
import type { CompanyProfileRow } from '../src/lib/companies';

const dir = path.join(process.cwd(), 'content', 'companies');
const outFile = path.join(process.cwd(), 'content', 'company-profiles-runtime.json');

function main() {
  if (!fs.existsSync(dir)) {
    console.warn('[precompute-company-profiles] content/companies directory not found');
    return;
  }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const map: Record<string, CompanyProfileRow> = {};

  for (const file of files) {
    const slug = file.replace('.md', '');
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const { data, content } = matter(raw);
    const website = data.website || undefined;
    const bodyPlain = content.replace(/^#+.*$/gm, '').replace(/[\r\n]+/g, ' ').trim();
    const frontDesc = typeof data.description === 'string' && data.description.trim() ? data.description.trim() : '';
    let description = '';
    if (frontDesc && bodyPlain && frontDesc !== bodyPlain) {
      description = (frontDesc + '\n\n' + bodyPlain).trim();
    } else {
      description = frontDesc || bodyPlain;
    }
    map[slug] = { website, description };
  }

  const overrideFile = path.join(process.cwd(), 'content/company-profile-overrides.json');
  type VerifiedOverride = CompanyProfileRow & { provenance: { website: { bodySha256: string }; about: { bodySha256: string }[]; branding?: { localSha256: string; downloadedLocalSha256?: string; optimization?: string } } };
  const overrides = fs.existsSync(overrideFile) ? JSON.parse(fs.readFileSync(overrideFile, 'utf8')) as Record<string, VerifiedOverride> : {};
  const optimizationFile = path.join(process.cwd(), 'content/static-image-optimization.json');
  const optimization = fs.existsSync(optimizationFile) ? JSON.parse(fs.readFileSync(optimizationFile, 'utf8')).files as Record<string, { sha256: string; status: string }> : {};
  let updatedProvenance = false;
  const branding: Record<string, { website: string; logo?: string }> = {};
  for (const [slug, profile] of Object.entries(overrides)) {
    const url = new URL(profile.website || '');
    if (!profile.verified || !profile.published || !profile.name || !profile.description || !profile.checkedAt || url.protocol !== 'https:' || url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash) throw new Error(`Invalid verified profile: ${slug}`);
    if (!/^[a-f0-9]{64}$/.test(profile.provenance?.website?.bodySha256 || '') || !profile.provenance?.about?.length || profile.provenance.about.some(page => !/^[a-f0-9]{64}$/.test(page.bodySha256))) throw new Error(`Missing official source provenance: ${slug}`);
    for (const [key, value] of Object.entries(profile.socialLinks || {})) {
      if (normalizeOfficialCompanySocial(value)?.key !== key) throw new Error(`Invalid verified social: ${slug}/${key}`);
    }
    if (profile.logo && (!/^\/logo\/companies\/[a-z0-9-]+\.png$/.test(profile.logo) || !fs.existsSync(path.join(process.cwd(), 'public', profile.logo)))) throw new Error(`Missing verified branding: ${slug}`);
    if (profile.logo) {
      const asset = profile.provenance.branding;
      const digest = createHash('sha256').update(fs.readFileSync(path.join(process.cwd(), 'public', profile.logo))).digest('hex');
      if (!asset) throw new Error(`Missing asset provenance: ${slug}`);
      if (asset.localSha256 !== digest) {
        if (optimization[profile.logo]?.sha256 !== digest || optimization[profile.logo]?.status !== 'optimized') throw new Error(`Unverified asset modification: ${slug}`);
        asset.downloadedLocalSha256 ||= asset.localSha256;
        asset.localSha256 = digest;
        asset.optimization = 'scripts/optimize-static-images.ts';
        updatedProvenance = true;
      }
    }
    map[slug] = { name: profile.name, website: profile.website, description: profile.description, published: true, verified: true, checkedAt: profile.checkedAt, socialLinks: profile.socialLinks || {}, ...(profile.logo && { logo: profile.logo }) };
    branding[slug] = { website: profile.website!, ...(profile.logo && { logo: profile.logo }) };
  }
  if (updatedProvenance) fs.writeFileSync(overrideFile, JSON.stringify(overrides, null, 2) + '\n');
  fs.writeFileSync(path.join(process.cwd(), 'content/company-branding.json'), JSON.stringify(branding, null, 2) + '\n');
  fs.writeFileSync(outFile, JSON.stringify(map));
  console.log(`[precompute-company-profiles] Wrote ${Object.keys(map).length} company profiles to ${outFile}`);
}

main();
