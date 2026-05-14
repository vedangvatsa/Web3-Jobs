import fs from 'fs';
import readline from 'readline';

// ─── Skill normalization map (synonyms → canonical name) ───
const SKILL_MAP = {
  // Languages
  'js':'JavaScript','javascript':'JavaScript','typescript':'TypeScript','ts':'TypeScript',
  'python':'Python','py':'Python','python3':'Python',
  'java':'Java','kotlin':'Kotlin','swift':'Swift','objective-c':'Objective-C','objc':'Objective-C',
  'c++':'C++','cpp':'C++','c#':'C#','csharp':'C#','.net':'.NET','dotnet':'.NET',
  'go':'Go','golang':'Go','rust':'Rust','ruby':'Ruby','php':'PHP',
  'scala':'Scala','r':'R','perl':'Perl','lua':'Lua','elixir':'Elixir','erlang':'Erlang',
  'haskell':'Haskell','clojure':'Clojure','dart':'Dart','julia':'Julia',
  'solidity':'Solidity','vyper':'Vyper','move':'Move','cairo':'Cairo',
  'sql':'SQL','nosql':'NoSQL','graphql':'GraphQL','html':'HTML','css':'CSS',
  'html5':'HTML','css3':'CSS','sass':'CSS','scss':'CSS','less':'CSS',
  'bash':'Bash','shell':'Bash','powershell':'PowerShell','zsh':'Bash',
  
  // Frontend
  'react':'React','reactjs':'React','react.js':'React','react js':'React',
  'next.js':'Next.js','nextjs':'Next.js','next':'Next.js',
  'vue':'Vue.js','vuejs':'Vue.js','vue.js':'Vue.js','nuxt':'Nuxt.js','nuxtjs':'Nuxt.js',
  'angular':'Angular','angularjs':'Angular',
  'svelte':'Svelte','sveltekit':'SvelteKit',
  'tailwind':'Tailwind CSS','tailwindcss':'Tailwind CSS',
  'bootstrap':'Bootstrap','material ui':'Material UI','mui':'Material UI',
  'redux':'Redux','zustand':'Zustand','mobx':'MobX',
  'webpack':'Webpack','vite':'Vite','rollup':'Rollup','esbuild':'esbuild',
  'jquery':'jQuery','storybook':'Storybook',
  'figma':'Figma','sketch':'Sketch','adobe xd':'Adobe XD',
  
  // Backend
  'node':'Node.js','nodejs':'Node.js','node.js':'Node.js',
  'express':'Express.js','expressjs':'Express.js','express.js':'Express.js',
  'fastapi':'FastAPI','flask':'Flask','django':'Django',
  'spring':'Spring','spring boot':'Spring Boot','springboot':'Spring Boot',
  'rails':'Ruby on Rails','ruby on rails':'Ruby on Rails','ror':'Ruby on Rails',
  'laravel':'Laravel','symfony':'Symfony',
  'nest':'NestJS','nestjs':'NestJS',
  'graphql':'GraphQL','rest':'REST API','restful':'REST API','rest api':'REST API',
  'grpc':'gRPC','websocket':'WebSocket','websockets':'WebSocket',
  
  // Databases
  'postgres':'PostgreSQL','postgresql':'PostgreSQL','pg':'PostgreSQL',
  'mysql':'MySQL','mariadb':'MariaDB','sqlite':'SQLite',
  'mongodb':'MongoDB','mongo':'MongoDB',
  'redis':'Redis','memcached':'Memcached',
  'elasticsearch':'Elasticsearch','elastic':'Elasticsearch','opensearch':'OpenSearch',
  'dynamodb':'DynamoDB','dynamo':'DynamoDB',
  'cassandra':'Cassandra','couchdb':'CouchDB','neo4j':'Neo4j',
  'snowflake':'Snowflake','bigquery':'BigQuery','redshift':'Redshift',
  'clickhouse':'ClickHouse','timescaledb':'TimescaleDB',
  'supabase':'Supabase','firebase':'Firebase','firestore':'Firebase',
  
  // Cloud & DevOps
  'aws':'AWS','amazon web services':'AWS','amazon':'AWS',
  'gcp':'GCP','google cloud':'GCP','google cloud platform':'GCP',
  'azure':'Azure','microsoft azure':'Azure',
  'docker':'Docker','kubernetes':'Kubernetes','k8s':'Kubernetes',
  'terraform':'Terraform','pulumi':'Pulumi','ansible':'Ansible',
  'jenkins':'Jenkins','github actions':'GitHub Actions','gitlab ci':'GitLab CI',
  'ci/cd':'CI/CD','cicd':'CI/CD','ci cd':'CI/CD',
  'nginx':'NGINX','apache':'Apache',
  'linux':'Linux','ubuntu':'Linux','centos':'Linux','debian':'Linux',
  'git':'Git','github':'GitHub','gitlab':'GitLab','bitbucket':'Bitbucket',
  'vercel':'Vercel','netlify':'Netlify','heroku':'Heroku','digitalocean':'DigitalOcean',
  'cloudflare':'Cloudflare',
  
  // Data & ML
  'machine learning':'Machine Learning','ml':'Machine Learning',
  'deep learning':'Deep Learning','dl':'Deep Learning',
  'ai':'AI','artificial intelligence':'AI',
  'llm':'LLM','large language model':'LLM',
  'openai':'OpenAI','gpt':'GPT','chatgpt':'GPT','claude':'Claude','gemini':'Gemini',
  'nlp':'NLP','natural language processing':'NLP',
  'computer vision':'Computer Vision','cv':'Computer Vision',
  'tensorflow':'TensorFlow','tf':'TensorFlow',
  'pytorch':'PyTorch','torch':'PyTorch',
  'pandas':'Pandas','numpy':'NumPy','scipy':'SciPy',
  'scikit-learn':'Scikit-learn','sklearn':'Scikit-learn',
  'spark':'Apache Spark','apache spark':'Apache Spark','pyspark':'Apache Spark',
  'hadoop':'Hadoop','hive':'Hive','presto':'Presto',
  'kafka':'Kafka','apache kafka':'Kafka','rabbitmq':'RabbitMQ',
  'airflow':'Apache Airflow','apache airflow':'Apache Airflow',
  'dbt':'dbt','etl':'ETL','data engineering':'Data Engineering',
  'data science':'Data Science','data analysis':'Data Analysis','data analytics':'Data Analytics',
  'tableau':'Tableau','power bi':'Power BI','looker':'Looker','metabase':'Metabase',
  
  // Web3 / Blockchain
  'blockchain':'Blockchain','web3':'Web3',
  'ethereum':'Ethereum','eth':'Ethereum',
  'bitcoin':'Bitcoin','btc':'Bitcoin',
  'defi':'DeFi','nft':'NFT','nfts':'NFT',
  'smart contracts':'Smart Contracts','smart contract':'Smart Contracts',
  'dapp':'dApp','dapps':'dApp','decentralized application':'dApp',
  'hardhat':'Hardhat','truffle':'Truffle','foundry':'Foundry','brownie':'Brownie',
  'ethers':'Ethers.js','ethers.js':'Ethers.js','web3.js':'Web3.js','web3js':'Web3.js',
  'ipfs':'IPFS','the graph':'The Graph','chainlink':'Chainlink',
  'polygon':'Polygon','matic':'Polygon',
  'arbitrum':'Arbitrum','optimism':'Optimism','base':'Base',
  'solana':'Solana','cosmos':'Cosmos','polkadot':'Polkadot','avalanche':'Avalanche',
  'binance smart chain':'BSC','bsc':'BSC',
  'metamask':'MetaMask','walletconnect':'WalletConnect',
  'erc-20':'ERC-20','erc20':'ERC-20','erc-721':'ERC-721','erc721':'ERC-721',
  
  // Security
  'security':'Security','cybersecurity':'Cybersecurity','infosec':'InfoSec',
  'penetration testing':'Penetration Testing','pentest':'Penetration Testing',
  'soc':'SOC','soc 2':'SOC 2','soc2':'SOC 2',
  'oauth':'OAuth','jwt':'JWT','ssl':'SSL/TLS','tls':'SSL/TLS',
  
  // Methodologies
  'agile':'Agile','scrum':'Scrum','kanban':'Kanban','jira':'Jira',
  'devops':'DevOps','sre':'SRE','site reliability':'SRE',
  'microservices':'Microservices','serverless':'Serverless',
  'event-driven':'Event-Driven','event driven':'Event-Driven',
  
  // Mobile
  'ios':'iOS','android':'Android','mobile':'Mobile',
  'react native':'React Native','flutter':'Flutter','xamarin':'Xamarin',
  'swiftui':'SwiftUI','jetpack compose':'Jetpack Compose',
  
  // Other
  'saas':'SaaS','b2b':'B2B','b2c':'B2C',
  'product management':'Product Management','ux':'UX','ui':'UI','ux/ui':'UX/UI','ui/ux':'UX/UI',
  'compliance':'Compliance','gdpr':'GDPR','sox':'SOX','kyc':'KYC','aml':'AML',
  'oracle':'Oracle','sap':'SAP','salesforce':'Salesforce','hubspot':'HubSpot',
};

function normalizeSkill(raw) {
  const s = raw.trim();
  if (!s || s === '-' || s.length < 2 || s.length > 60) return null;
  const lower = s.toLowerCase().trim();
  return SKILL_MAP[lower] || s; // Return canonical or original (preserving case)
}

function parseLine(line) {
  const fields = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) { if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; } else if (ch === '"') inQ = false; else cur += ch; }
    else { if (ch === '"') inQ = true; else if (ch === ',') { fields.push(cur); cur = ''; } else cur += ch; }
  }
  fields.push(cur); return fields;
}

async function extractSkills(path, skillIdx, label) {
  const rl = readline.createInterface({ input: fs.createReadStream(path), crlfDelay: Infinity });
  let ln = 0, total = 0, withSkills = 0;
  const skills = {};
  
  for await (const line of rl) {
    if (ln === 0) { ln++; continue; }
    const f = parseLine(line);
    if (f.length <= skillIdx) { ln++; continue; }
    total++;
    const raw = (f[skillIdx]||'').trim();
    if (!raw || raw === '-') { ln++; continue; }
    withSkills++;
    // Split by semicolon, comma, or pipe
    raw.split(/[;|]/).forEach(s => {
      const norm = normalizeSkill(s);
      if (norm) skills[norm] = (skills[norm]||0)+1;
    });
    ln++;
  }
  console.log(`${label}: ${total} jobs, ${withSkills} with skills, ${Object.keys(skills).length} unique skills`);
  return { skills, total, withSkills };
}

async function main() {
  console.log('Extracting CVin.bio skills (field 9: Skills)...');
  const cvin = await extractSkills('path/to/local', 9, 'CVin.bio');
  
  console.log('Extracting Web3 Jobs skills (field 5: Skills)...');
  const web3 = await extractSkills('jobs-extracted.csv', 5, 'Web3 Jobs');
  
  // Merge — normalize keys to group case variants
  const mergeMap = {};
  function addToMerge(skills, platform) {
    for (const [skill, count] of Object.entries(skills)) {
      const key = skill.toLowerCase();
      if (!mergeMap[key]) mergeMap[key] = { canonical: skill, cvin: 0, web3: 0 };
      // Keep the most common casing
      mergeMap[key][platform] += count;
    }
  }
  addToMerge(cvin.skills, 'cvin');
  addToMerge(web3.skills, 'web3');
  
  // Sort by combined count
  const merged = Object.values(mergeMap).map(r => ({
    skill: r.canonical,
    cvin: r.cvin,
    web3: r.web3,
    total: r.cvin + r.web3,
  }));
  merged.sort((a,b) => b.total - a.total);
  
  const grandTotal = cvin.total + web3.total;
  const esc = v => '"' + String(v||'').replace(/"/g,'""') + '"';
  
  const rows = ['Skill,CVin.bio Jobs,CVin.bio %,Web3 Jobs,Web3 %,Combined Total,Combined %'];
  merged.forEach(r => {
    rows.push([
      esc(r.skill),
      r.cvin, r.cvin ? (r.cvin/cvin.total*100).toFixed(1)+'%' : '0%',
      r.web3, r.web3 ? (r.web3/web3.total*100).toFixed(1)+'%' : '0%',
      r.total, (r.total/grandTotal*100).toFixed(1)+'%'
    ].join(','));
  });
  
  fs.writeFileSync('path/to/local', rows.join('\n'));
  console.log(`\n✅ Written path/to/local (${merged.length} unique skills)`);
  
  // Print top 30
  console.log('\nTop 30 Skills (combined):');
  merged.slice(0, 30).forEach((r, i) => {
    console.log(`  ${(i+1).toString().padStart(2)}. ${r.skill.padEnd(25)} CVin: ${r.cvin.toString().padStart(6)}  Web3: ${r.web3.toString().padStart(5)}  Total: ${r.total}`);
  });
}

main().catch(e => { console.error(e); process.exit(1); });
