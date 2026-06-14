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
  
  // Remove the import statement
  content = content.replace(/import\s+\{\s*Header\s*\}\s+from\s+['"]@\/components\/header['"];?\s*\n/g, "");
  
  // Remove the Header component
  content = content.replace(/<Header\s*\/>\s*\n/g, "");
  // Also handle cases with extra spaces or no newline
  content = content.replace(/\s*<Header\s*\/>\s*/g, "\n");

  if (content !== original) {
    fs.writeFileSync(file, content);
    updatedFiles++;
    console.log("Updated: " + file);
  }
}
console.log("Total updated files: " + updatedFiles);
