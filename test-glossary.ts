import { getTerm } from './src/lib/glossary';

async function main() {
  console.log("Fetching term 'smart-contract'...");
  try {
    const term = await getTerm('smart-contract');
    console.log("Term fetched successfully!");
    console.log("Title:", term?.term);
    console.log("Content HTML length:", term?.content?.length);
    console.log("Sample Content:", term?.content?.substring(0, 500));
  } catch (error) {
    console.error("Error fetching term:", error);
  }
}

main();
