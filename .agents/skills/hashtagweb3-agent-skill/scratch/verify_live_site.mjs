import fetch from 'node-fetch';

async function verifySite() {
  console.log("🔍 Fetching live homepage: https://hashtagweb3.com ...");
  
  try {
    const res = await fetch("https://hashtagweb3.com");
    console.log(`📡 Homepage Response: ${res.status} ${res.statusText}`);
    
    if (res.status === 200) {
      console.log(`✅ Homepage loaded successfully!`);
      
      // Directly verify core website pages
      const corePages = ["/events", "/news", "/community", "/companies"];
      
      for (const route of corePages) {
        const url = `https://hashtagweb3.com${route}`;
        console.log(`\n🖱️ Simulating click: Fetching subpage ${url} ...`);
        const subRes = await fetch(url);
        console.log(`📡 Response for ${route}: ${subRes.status} ${subRes.statusText}`);
        
        if (subRes.status === 200) {
          console.log(`✅ Subpage ${route} is fully functional!`);
        } else {
          console.log(`⚠️ Subpage ${route} returned status: ${subRes.status}`);
        }
      }
    }
  } catch (e) {
    console.error("❌ Failed to connect:", e.message);
  }
}

verifySite();
