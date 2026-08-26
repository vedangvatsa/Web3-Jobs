import fs from 'fs';
import path from 'path';

const LOGO_PATHS = (slug: string): string[] => {
  const lower = slug.toLowerCase();
  return [
    `/logo/companies/${slug}.png`,
    `/logo/companies/${slug}.jpg`,
    `/logo/companies/${slug}.svg`,
    `/logo/companies/${lower}.png`,
    `/logo/job/${slug}.png`,
    `/logo/job/${slug}.jpg`,
    `/logo/job/${slug}.svg`,
    `/logo/job/${lower}.png`,
    `/logo/partners/${slug}.png`,
    `/logo/partners/${lower}.png`,
  ];
};

export function resolveCompanyLogo(companySlug: string): string | null {
  for (const relPath of LOGO_PATHS(companySlug)) {
    try {
      if (fs.existsSync(path.join(process.cwd(), 'public', relPath))) {
        return relPath;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export function getCompanyFaviconUrl(website: string | null | undefined): string | null {
  if (!website) return null;
  try {
    const host = new URL(website.startsWith('http') ? website : `https://${website}`).hostname;
    return `https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${host}&size=128`;
  } catch {
    return null;
  }
}
