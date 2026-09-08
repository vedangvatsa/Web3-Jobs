import fs from "fs";

interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  slug: string;
  source: string;
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function auditDuplicates() {
  const jobs: Job[] = JSON.parse(fs.readFileSync("content/jobs-cache.json", "utf-8"));
  console.log(`Auditing total ${jobs.length} jobs for potential duplicates...`);

  // 1. Exact ID duplicates
  const idCounts = new Map<string, number>();
  jobs.forEach(j => idCounts.set(j.id, (idCounts.get(j.id) || 0) + 1));
  const idDupes = Array.from(idCounts.entries()).filter(([_, count]) => count > 1);

  // 2. Exact URL link duplicates
  const linkCounts = new Map<string, number>();
  jobs.forEach(j => {
    const cleanLink = j.link.split('?')[0].replace(/\/$/, '').toLowerCase();
    linkCounts.set(cleanLink, (linkCounts.get(cleanLink) || 0) + 1);
  });
  const linkDupes = Array.from(linkCounts.entries()).filter(([_, count]) => count > 1);

  // 3. Same Company + Same Title combo duplicates
  const comboCounts = new Map<string, Job[]>();
  jobs.forEach(j => {
    const key = `${normalize(j.company)}::${normalize(j.title)}`;
    const list = comboCounts.get(key) || [];
    list.push(j);
    comboCounts.set(key, list);
  });
  const comboDupes = Array.from(comboCounts.entries()).filter(([_, list]) => list.length > 1);

  console.log("\n========================================");
  console.log(`1. Exact ID Duplicates: ${idDupes.length}`);
  console.log(`2. Exact URL Link Duplicates: ${linkDupes.length}`);
  console.log(`3. Same (Company + Title) Duplicates: ${comboDupes.length}`);
  console.log("========================================\n");

  if (comboDupes.length > 0) {
    console.log("Sample Same (Company + Title) Pairs:");
    comboDupes.slice(0, 10).forEach(([key, list]) => {
      console.log(`\nKey: ${key}`);
      list.forEach(item => {
        console.log(`  - [ID: ${item.id}] ${item.title} | ${item.company} | Source: ${item.source} | Link: ${item.link}`);
      });
    });
  }
}

auditDuplicates();
