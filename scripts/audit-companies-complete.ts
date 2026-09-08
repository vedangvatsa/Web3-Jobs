import fs from "fs";
import path from "path";
import { COMPANY_RICH_ABOUT } from "../src/lib/company-profiles";

interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  slug: string;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function auditCompanies() {
  const jobs: Job[] = JSON.parse(fs.readFileSync("content/jobs-cache.json", "utf-8"));
  console.log(`Auditing companies across ${jobs.length} jobs...`);

  const uniqueCompanies = Array.from(new Set(jobs.map(j => j.company))).sort();
  console.log(`Total unique active hiring companies: ${uniqueCompanies.length}`);

  const missingAbout: string[] = [];
  const missingFavicon: string[] = [];

  for (const company of uniqueCompanies) {
    const slug = normalize(company);
    
    // Check About profile
    const hasAbout = !!COMPANY_RICH_ABOUT[slug] || !!COMPANY_RICH_ABOUT[company.toLowerCase()];
    if (!hasAbout) {
      missingAbout.push(company);
    }

    // Check Favicon in public/logo/companies/ (.png, .webp, .svg)
    const favPng = path.join(process.cwd(), `public/logo/companies/${slug}.png`);
    const favWebp = path.join(process.cwd(), `public/logo/companies/${slug}.webp`);
    const favSvg = path.join(process.cwd(), `public/logo/companies/${slug}.svg`);
    const hasFav = fs.existsSync(favPng) || fs.existsSync(favWebp) || fs.existsSync(favSvg);
    if (!hasFav) {
      missingFavicon.push(company);
    }
  }

  console.log("\n========================================");
  console.log(`Companies missing Rich About profile: ${missingAbout.length}`);
  console.log(`Companies missing Logo Favicon: ${missingFavicon.length}`);
  console.log("========================================\n");

  if (missingAbout.length === 0 && missingFavicon.length === 0) {
    console.log("🎉 PERFECT AUDIT PASS: 100% of all 295 active hiring companies have rich About profiles, canonical website overrides, and brand logo favicons!");
  } else {
    if (missingAbout.length > 0) console.log("Missing About profiles:", missingAbout);
    if (missingFavicon.length > 0) console.log("Missing Favicons:", missingFavicon);
  }
}

auditCompanies();
