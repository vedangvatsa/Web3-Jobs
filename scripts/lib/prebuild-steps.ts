export type PrebuildStep = {
  id: string;
  inputs: string[];
  outputs: string[];
  command: string;
};

/** Input → output prep steps (order matters). */
export const PREBUILD_DATA_STEPS: PrebuildStep[] = [
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
    inputs: ['content/jobs-cache.json'],
    outputs: ['content/jobs-runtime.json', 'content/homepage-jobs.json'],
    command: 'npx tsx scripts/precompute-jobs-runtime.ts',
  },
  {
    id: 'events-runtime',
    inputs: ['content/events'],
    outputs: ['content/events-runtime.json'],
    command: 'npx tsx scripts/precompute-events-runtime.ts',
  },
  {
    id: 'glossary-runtime',
    inputs: ['content/glossary'],
    outputs: ['content/glossary-runtime.json'],
    command: 'npx tsx scripts/precompute-glossary-runtime.ts',
  },
  {
    id: 'companies-runtime',
    inputs: ['content/jobs-runtime.json'],
    outputs: ['content/companies-runtime.json'],
    command: 'npx tsx scripts/precompute-companies-runtime.ts',
  },
  {
    id: 'company-profiles',
    inputs: ['content/jobs-runtime.json', 'content/companies-runtime.json'],
    outputs: ['content/company-profiles-runtime.json'],
    command: 'npx tsx scripts/precompute-company-profiles.ts',
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
    ],
    outputs: ['content/slug-types.json'],
    command: 'npx tsx scripts/generate-slug-types.ts',
  },
];

export const SITEMAP_STEP: PrebuildStep = {
  id: 'sitemap',
  inputs: ['content/slug-types.json', 'content/articles-index.json'],
  outputs: ['content/sitemap-routes.json', 'public/sitemap.xml'],
  command: 'npx tsx scripts/generate-sitemap-json.ts',
};
