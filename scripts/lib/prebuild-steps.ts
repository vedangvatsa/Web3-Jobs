import { JOB_SHARD_COUNT, getJobShardFilename } from '../../src/lib/job-shards';
import nomadCities from '../../content/nomads/cities.json';
import passportCountries from '../../content/nomads/countries.json';
import { NOMAD_STATIC_PATHS } from '../../src/lib/nomads/routes';
import displayImagesJson from '../../content/nomad-display-images.json';

export type PrebuildStep = {
  id: string;
  inputs: string[];
  outputs: string[];
  command: string;
};

const JOB_SHARD_OUTPUTS = Array.from({ length: JOB_SHARD_COUNT }, (_, i) =>
  `content/job-shards/${getJobShardFilename(i)}`,
);

/** Input → output prep steps (order matters). */
export const PREBUILD_DATA_STEPS: PrebuildStep[] = [
  {
    id: 'removed-job-paths',
    inputs: ['content/removed-job-listings.json', 'content/jobs-cache.json', 'content/legacy-slugs-archive.json', 'content/slug-types.json', 'src/lib/reserved-root-slugs.ts', 'scripts/precompute-removed-job-paths.ts'],
    outputs: ['content/removed-job-paths.json', 'content/recovered-job-redirects.json'],
    command: 'npx tsx scripts/precompute-removed-job-paths.ts',
  },
  {
    id: 'nomad-display-images',
    inputs: ['content/nomads/cities.json', 'public/images/nomads', 'scripts/precompute-nomad-images.ts'],
    outputs: ['content/nomad-display-images.json', ...Object.values(displayImagesJson as Record<string, { base: string; width: number }>).flatMap(image => [480, image.width].map(width => `public${image.base}-${width}.webp`))],
    command: 'npx tsx scripts/precompute-nomad-images.ts',
  },
  {
    id: 'nomad-page-og',
    inputs: ['content/nomads/cities.json', 'content/nomads/tool-paths.json', 'src/lib/nomads/metadata.ts', 'src/lib/nomads/routes.ts', 'scripts/precompute-page-og-images.ts', 'scripts/lib/og-png-compress.ts', 'scripts/social/fonts/Inter-Bold.ttf'],
    outputs: [...NOMAD_STATIC_PATHS, ...nomadCities.map(city => `/${city.slug}`)].map(href => `public/og/pages${href}.png`),
    command: 'npx tsx scripts/precompute-page-og-images.ts --if-missing',
  },
  {
    id: 'nomad-catalogs',
    inputs: ['content/nomads', 'public/images/nomads', 'scripts/precompute-nomads.ts', 'scripts/lib/passport-policies.ts', 'scripts/lib/passport-index.ts', 'scripts/lib/passport-factchecks.ts', 'src/lib/nomads/types.ts', 'src/lib/nomads/entry-rules.ts'],
    outputs: [
      'public/data/nomads/cities.json', 'public/data/nomads/places.json', 'public/data/nomads/passports.json',
      ...nomadCities.map(city => `public/data/nomads/cities/${city.slug}.json`),
      ...nomadCities.map(city => `public/images/nomads/${city.slug}-128.webp`),
      ...passportCountries.map(country => `public/data/nomads/passports/${country.id}.json`),
    ],
    command: 'npx tsx scripts/precompute-nomads.ts',
  },
  {
    id: 'company-logos-index',
    inputs: ['public/logo/companies'],
    outputs: ['content/company-logos-index.json'],
    command: 'npx tsx scripts/generate-company-logos-index.ts',
  },
  {
    id: 'learn-runtime',
    inputs: ['content/learn'],
    outputs: ['content/learn-runtime.json'],
    command: 'npx tsx scripts/precompute-learn-runtime.ts',
  },
  {
    id: 'pseo-resources',
    inputs: ['content/generated'],
    outputs: ['content/pseo-resources-runtime.json'],
    command: 'npx tsx scripts/precompute-pseo-resources.ts',
  },
  {
    id: 'jobs-runtime',
    inputs: ['content/jobs-cache.json', 'content/rejected-ats-boards.json', 'content/removed-job-listings.json', 'src/lib/jobs-listing-build.ts', 'src/lib/job-source-policy.ts', 'src/lib/job-filters.ts', 'src/lib/job-location.ts'],
    outputs: [
      'content/jobs-runtime.json',
      'content/homepage-jobs.json',
      ...JOB_SHARD_OUTPUTS,
    ],
    command: 'npx tsx scripts/precompute-jobs-runtime.ts',
  },
  {
    id: 'events-runtime',
    inputs: ['content/events', 'src/lib/events-listing-build.ts', 'src/lib/event-slug-assignment.ts'],
    outputs: ['content/events-runtime.json', 'content/event-slug-history.json'],
    command: 'npx tsx scripts/precompute-events-runtime.ts',
  },
  {
    id: 'glossary-runtime',
    inputs: ['content/glossary'],
    outputs: ['content/glossary-runtime.json'],
    command: 'npx tsx scripts/precompute-glossary-runtime.ts',
  },
  {
    id: 'company-profiles',
    inputs: ['content/companies'],
    outputs: ['content/company-profiles-runtime.json'],
    command: 'npx tsx scripts/precompute-company-profiles.ts',
  },
  {
    id: 'companies-runtime',
    inputs: ['content/jobs-runtime.json', 'content/company-profiles-runtime.json', 'src/lib/companies.ts', 'src/lib/company-profiles.ts'],
    outputs: ['content/companies-runtime.json'],
    command: 'npx tsx scripts/precompute-companies-runtime.ts',
  },
  {
    id: 'articles-index',
    inputs: ['content/articles'],
    outputs: ['content/articles-index.json'],
    command: 'npx tsx scripts/generate-articles-index.ts',
  },
  {
    id: 'articles-data',
    inputs: ['content/articles', 'content/articles-index.json'],
    outputs: ['public/articles-data'],
    command: 'npx tsx scripts/generate-articles-data.ts',
  },
  {
    id: 'slug-types',
    inputs: [
      'content/jobs-runtime.json',
      'content/events-runtime.json',
      'content/glossary-runtime.json',
      'content/companies-runtime.json',
      'content/pseo-resources-runtime.json',
      'src/app/nomads/page.tsx',
      'content/nomads/tool-paths.json',
      'content/nomads/legacy-routes.json',
      'src/lib/nomads/routes.ts',
      'src/lib/nomads/metadata.ts',
      'scripts/generate-slug-types.ts',
    ],
    outputs: ['content/slug-types.json'],
    command: 'npx tsx scripts/generate-slug-types.ts',
  },
];

export const SITEMAP_STEP: PrebuildStep = {
  id: 'sitemap',
  inputs: ['content/slug-types.json', 'content/articles-index.json', 'src/lib/sitemap-build.ts', 'content/nomads/cities.json', 'content/nomads/sources.json', 'content/nomads/tool-paths.json', 'src/lib/nomads/types.ts', 'src/lib/nomads/routes.ts', 'src/lib/nomads/metadata.ts'],
  outputs: ['content/sitemap-routes.json', 'public/sitemap.xml'],
  command: 'npx tsx scripts/generate-sitemap-json.ts',
};
