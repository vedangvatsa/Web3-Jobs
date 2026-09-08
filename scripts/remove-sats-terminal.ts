import fs from "fs";
import path from "path";

function removeSatsTerminal() {
  const cachePath = path.join(process.cwd(), "content/jobs-cache.json");
  const descPath = path.join(process.cwd(), "content/job-descriptions.json");

  const jobs: any[] = JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  const descs: Record<string, string> = JSON.parse(fs.readFileSync(descPath, "utf-8"));

  const initialCount = jobs.length;
  const filteredJobs = jobs.filter((j: any) => {
    const comp = (j.company || "").toLowerCase();
    const title = (j.title || "").toLowerCase();
    const link = (j.link || "").toLowerCase();
    return !comp.includes("sats terminal") && !title.includes("sats terminal") && !link.includes("satsterminal");
  });

  const removedCount = initialCount - filteredJobs.length;
  console.log(`Removed ${removedCount} Sats Terminal jobs from cache.`);

  fs.writeFileSync(cachePath, JSON.stringify(filteredJobs, null, 2));

  // Add Sats Terminal to BLOCKED_COMPANIES or BLOCKED_TERMS if any in filters
  const logoPathPng = path.join(process.cwd(), "public/logo/companies/sats-terminal.png");
  if (fs.existsSync(logoPathPng)) {
    fs.unlinkSync(logoPathPng);
    console.log("Removed Sats Terminal logo asset.");
  }
}

removeSatsTerminal();
