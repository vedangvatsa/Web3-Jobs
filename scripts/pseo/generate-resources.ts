/**
 * pSEO Resource Page Generator
 * 
 * This script generates structured JSON content for "X for Y" resource pages
 * using the Gemini API with strict JSON schemas.
 * 
 * Usage:
 *   npx tsx scripts/pseo/generate-resources.ts [options]
 * 
 * Options:
 *   --type <type>     Content type: ideas, checklists, templates, guides, mistakes, tools, skills
 *   --niche <slug>    Niche slug (e.g., solidity-developer)
 *   --topic <slug>    Topic slug (e.g., portfolio-project)
 *   --all             Generate all valid combinations
 *   --dry-run         Show what would be generated without calling API
 */

import * as fs from 'fs';
import * as path from 'path';

// Load taxonomy files
const TAXONOMY_DIR = path.join(process.cwd(), 'content', 'taxonomy');
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'generated');

interface NicheContext {
  audience: string;
  painPoints: string[];
  skills: string[];
  salaryRange: { min: number; max: number; currency: string };
  careerPaths: string[];
  contentThatWorks: string;
  subtopics: string[];
}

interface Niche {
  slug: string;
  name: string;
  shortName: string;
  category: string;
  context: NicheContext;
}

interface ContentType {
  slug: string;
  name: string;
  titleTemplate: string;
  description: string;
  icon: string;
  itemsPerSection: number;
  sectionsCount: number;
  proTipsCount: number;
  schema: { item: Record<string, unknown> };
  examples: string[];
}

interface Topic {
  slug: string;
  name: string;
  applicableTypes: string[];
  applicableNiches: string[];
}

function loadTaxonomy() {
  const niches: Niche[] = JSON.parse(
    fs.readFileSync(path.join(TAXONOMY_DIR, 'niches.json'), 'utf-8')
  ).niches;
  
  const contentTypes: ContentType[] = JSON.parse(
    fs.readFileSync(path.join(TAXONOMY_DIR, 'content-types.json'), 'utf-8')
  ).contentTypes;
  
  const topics: Topic[] = JSON.parse(
    fs.readFileSync(path.join(TAXONOMY_DIR, 'topics.json'), 'utf-8')
  ).topics;
  
  return { niches, contentTypes, topics };
}

function getValidCombinations(taxonomy: ReturnType<typeof loadTaxonomy>) {
  const combinations: Array<{ contentType: ContentType; topic: Topic; niche: Niche }> = [];
  
  for (const topic of taxonomy.topics) {
    for (const typeSlug of topic.applicableTypes) {
      const contentType = taxonomy.contentTypes.find(t => t.slug === typeSlug);
      if (!contentType) continue;
      
      for (const nicheSlug of topic.applicableNiches) {
        const niche = taxonomy.niches.find(n => n.slug === nicheSlug);
        if (!niche) continue;
        
        combinations.push({ contentType, topic, niche });
      }
    }
  }
  
  return combinations;
}

function generateTitle(contentType: ContentType, topic: Topic, niche: Niche): string {
  let title = contentType.titleTemplate;
  
  const count = contentType.itemsPerSection * contentType.sectionsCount;
  
  title = title.replace('{count}', String(count));
  title = title.replace('{topic}', topic.name);
  title = title.replace('{niche}', niche.name);
  title = title.replace('{year}', '2026');
  
  return title;
}

function generateSlug(contentType: ContentType, topic: Topic, niche: Niche): string {
  return `${topic.slug}-${contentType.slug}-for-${niche.slug}`;
}

function buildPrompt(contentType: ContentType, topic: Topic, niche: Niche): string {
  const title = generateTitle(contentType, topic, niche);
  const itemCount = contentType.itemsPerSection;
  const sectionCount = contentType.sectionsCount;
  
  const nicheContext = `
Target Audience: ${niche.context.audience}
Common Pain Points: ${niche.context.painPoints.join(', ')}
Key Skills: ${niche.context.skills.join(', ')}
Relevant Subtopics: ${niche.context.subtopics.join(', ')}
Content That Works: ${niche.context.contentThatWorks}
`;

  const schemaDescription = JSON.stringify(contentType.schema.item, null, 2);

  return `Generate content for: "${title}"

NICHE CONTEXT:
${nicheContext}

REQUIREMENTS:
- Create exactly ${sectionCount} sections
- Each section must have exactly ${itemCount} items
- Generate exactly 5 pro tips
- All content must be specific to ${niche.name}, not generic
- Include practical, actionable information
- Reference real tools, techniques, and concepts used by ${niche.shortName}

SECTION STRUCTURE:
Each section should cover a different aspect/category relevant to the topic.

ITEM SCHEMA (each item must match this structure):
${schemaDescription}

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "intro": "A compelling 2-3 sentence introduction specific to ${niche.name}",
  "sections": [
    {
      "heading": "Section Title",
      "description": "Brief section description",
      "items": [/* ${itemCount} items matching the schema */]
    }
  ],
  "proTips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "relatedResources": ["Related topic 1", "Related topic 2", "Related topic 3"]
}

Remember: Every piece of content should demonstrate deep understanding of what ${niche.name} actually do day-to-day. Use specific terminology, tools, and scenarios they encounter.`;
}

async function generateWithGemini(prompt: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
          maxOutputTokens: 8192,
        }
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }
  
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('No content in Gemini response');
  }
  
  return JSON.parse(text);
}

function saveResource(
  contentType: ContentType,
  topic: Topic,
  niche: Niche,
  content: unknown
) {
  const slug = generateSlug(contentType, topic, niche);
  const title = generateTitle(contentType, topic, niche);
  
  const resourcePage = {
    meta: {
      contentType: contentType.slug,
      topic: topic.slug,
      niche: niche.slug,
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    },
    seo: {
      title,
      description: `${title} - A comprehensive resource for ${niche.name} looking to advance their career in Web3.`,
      keywords: [
        niche.slug,
        contentType.slug,
        topic.slug,
        'web3',
        'crypto',
        'blockchain',
        ...niche.context.skills.slice(0, 5)
      ],
      canonicalSlug: slug
    },
    content
  };
  
  const typeDir = path.join(OUTPUT_DIR, contentType.slug);
  if (!fs.existsSync(typeDir)) {
    fs.mkdirSync(typeDir, { recursive: true });
  }
  
  const filePath = path.join(typeDir, `${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(resourcePage, null, 2));
  
  console.log(`✓ Generated: ${filePath}`);
  return filePath;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const generateAll = args.includes('--all');
  
  const typeIndex = args.indexOf('--type');
  const nicheIndex = args.indexOf('--niche');
  const topicIndex = args.indexOf('--topic');
  
  const typeFilter = typeIndex !== -1 ? args[typeIndex + 1] : undefined;
  const nicheFilter = nicheIndex !== -1 ? args[nicheIndex + 1] : undefined;
  const topicFilter = topicIndex !== -1 ? args[topicIndex + 1] : undefined;
  
  console.log('🚀 pSEO Resource Generator\n');
  
  const taxonomy = loadTaxonomy();
  let combinations = getValidCombinations(taxonomy);
  
  console.log(`Found ${combinations.length} valid combinations\n`);
  
  // Apply filters
  if (typeFilter) {
    combinations = combinations.filter(c => c.contentType.slug === typeFilter);
  }
  if (nicheFilter) {
    combinations = combinations.filter(c => c.niche.slug === nicheFilter);
  }
  if (topicFilter) {
    combinations = combinations.filter(c => c.topic.slug === topicFilter);
  }
  
  if (!generateAll && !typeFilter && !nicheFilter && !topicFilter) {
    console.log('Available combinations (first 20):');
    combinations.slice(0, 20).forEach(({ contentType, topic, niche }) => {
      const title = generateTitle(contentType, topic, niche);
      console.log(`  - ${title}`);
    });
    console.log(`\nUse --all to generate all, or filter with --type, --niche, --topic`);
    console.log(`Example: npx tsx scripts/pseo/generate-resources.ts --type ideas --niche solidity-developer`);
    return;
  }
  
  console.log(`Will generate ${combinations.length} pages${dryRun ? ' (dry run)' : ''}\n`);
  
  if (dryRun) {
    combinations.forEach(({ contentType, topic, niche }) => {
      const title = generateTitle(contentType, topic, niche);
      const slug = generateSlug(contentType, topic, niche);
      console.log(`Would generate: ${slug}`);
      console.log(`  Title: ${title}\n`);
    });
    return;
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Generate with concurrency limit
  const CONCURRENCY = 5;
  const results: string[] = [];
  const errors: Array<{ combo: typeof combinations[0]; error: Error }> = [];
  
  for (let i = 0; i < combinations.length; i += CONCURRENCY) {
    const batch = combinations.slice(i, i + CONCURRENCY);
    
    const promises = batch.map(async (combo) => {
      try {
        const prompt = buildPrompt(combo.contentType, combo.topic, combo.niche);
        const content = await generateWithGemini(prompt);
        const filePath = saveResource(combo.contentType, combo.topic, combo.niche, content);
        results.push(filePath);
      } catch (error) {
        errors.push({ combo, error: error as Error });
        console.error(`✗ Failed: ${generateSlug(combo.contentType, combo.topic, combo.niche)}`);
        console.error(`  Error: ${(error as Error).message}`);
      }
    });
    
    await Promise.all(promises);
    
    // Rate limiting pause between batches
    if (i + CONCURRENCY < combinations.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n✅ Generated ${results.length} pages`);
  if (errors.length > 0) {
    console.log(`❌ Failed: ${errors.length} pages`);
  }
}

main().catch(console.error);
