import fs from "fs";
import path from "path";
import { isConcreteJobOpening, cleanCompanyName } from "../src/lib/job-filters";
import { getJobContentKey } from "../src/lib/job-slugs";

const TODAY = new Date().toISOString().slice(0, 10);
const CACHE_PATH = path.join(process.cwd(), "content/jobs-cache.json");

function getOneWordRole(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("solidity")) return "solidity";
  if (t.includes("rust")) return "rust";
  if (t.includes("frontend") || /\b(ui|ux)\b/i.test(t)) return "frontend";
  if (t.includes("backend")) return "backend";
  if (t.includes("product") || /\bpm\b/i.test(t)) return "product";
  if (t.includes("analyst") || t.includes("trader") || t.includes("quant")) return "quant";
  if (t.includes("audit") || t.includes("security")) return "security";
  if (t.includes("compliance") || t.includes("legal") || t.includes("risk") || t.includes("mlro") || t.includes("kyc")) return "compliance";
  if (t.includes("recruiting") || t.includes("talent") || /\bhr\b/i.test(t)) return "recruiter";
  if (t.includes("manager") || t.includes("lead")) return "manager";
  if (t.includes("operations") || /\bops\b/i.test(t)) return "operations";
  if (t.includes("support") || t.includes("associate")) return "associate";
  return "job";
}

async function integrateSolanaGetroJobs() {
  const getroJobs: any[] = JSON.parse(fs.readFileSync("scripts/solana_getro_all_jobs.json", "utf-8"));
  const cacheData: any[] = JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));

  console.log(`Loaded ${getroJobs.length} Getro ecosystem jobs.`);
  let added = 0, updated = 0;

  for (const j of getroJobs) {
    if (!j.title || !j.url || !isConcreteJobOpening(j.title, j.url)) continue;

    const company = cleanCompanyName(j.organization?.name || "Solana Ecosystem");
    const roleWord = getOneWordRole(j.title);
    const shortId = String(j.id).slice(-5);

    const job = {
      id: `solana-getro-${j.id}`,
      title: j.title.trim(),
      company,
      link: j.url,
      applyUrl: j.url,
      date: j.createdAt ? new Date(j.createdAt * 1000).toISOString().slice(0, 10) : TODAY,
      source: `Getro: Solana Ecosystem [solana]`,
      location: (j.locations && j.locations.length > 0) ? j.locations.join(", ") : (j.workMode || "Remote"),
      department: "Solana Ecosystem",
      skills: ["Solana", "Rust", "Web3", "Blockchain", ...(j.skills || [])],
      active: true,
      slug: `${roleWord}${shortId}`
    };

    const idx = cacheData.findIndex((e: any) => e.id === job.id || e.link === job.link);
    if (idx === -1) {
      cacheData.unshift(job);
      added++;
    } else {
      cacheData[idx] = { ...cacheData[idx], ...job, slug: cacheData[idx].slug || job.slug };
      updated++;
    }
  }

  console.log(`Solana Getro Integration Results:`);
  console.log(`  - New Jobs Added: ${added}`);
  console.log(`  - Existing Jobs Updated: ${updated}`);
  console.log(`  - Total Jobs in Cache: ${cacheData.length}`);

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cacheData, null, 2));
}

integrateSolanaGetroJobs();
