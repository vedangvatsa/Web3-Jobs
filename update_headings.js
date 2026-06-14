const fs = require("fs");
const path = require("path");

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith("page.tsx")) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk("./src/app");
let updatedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  
  // Replace <h1> tags, skipping those with "sr-only" (screen reader hidden tags)
  let hasReplaced = false;
  content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, (match, innerText) => {
    if (match.includes("sr-only")) return match;
    
    hasReplaced = true;
    let titleText = innerText.trim();
    
    // Check if innerText has HTML tags, if so it might be complex. 
    // We'll wrap it in curly braces as a fragment or just use it as string if simple.
    if (titleText.includes("<") || titleText.includes("\n")) {
      // If it contains a child component like <span className="text-primary">,
      // we pass it as a React node
      return `<PageHeader title={<>${titleText}</>} />`;
    }
    
    if (titleText.startsWith("{") && titleText.endsWith("}")) {
       return `<PageHeader title=${titleText} />`;
    }
    
    // It's just plain text
    return `<PageHeader title="${titleText}" />`;
  });

  if (hasReplaced && !content.includes("@/components/page-header")) {
    // Add import statement after the last import
    const importMatch = content.match(/import.*?;\n/g);
    if (importMatch && importMatch.length > 0) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + `import { PageHeader } from "@/components/page-header";\n`);
    } else {
      content = `import { PageHeader } from "@/components/page-header";\n` + content;
    }
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    updatedFiles++;
    console.log("Updated: " + file);
  }
}
console.log("Total typography files updated: " + updatedFiles);
