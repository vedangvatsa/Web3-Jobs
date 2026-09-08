import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import fs from "fs";

// Read all scripts in scripts/ to find event targets
const files = fs.readdirSync("./scripts");
const eventFiles = files.filter(f => f.includes("event") || f.includes("partnerships"));

console.log("Event script files:", eventFiles);

