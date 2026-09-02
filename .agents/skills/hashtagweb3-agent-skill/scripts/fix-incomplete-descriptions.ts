#!/usr/bin/env node

/**
 * Fix Incomplete Article Descriptions
 * 
 * Scans all articles and fixes descriptions ending with "and."
 * Uses article titles and first paragraph to generate contextual completions
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ArticleFile {
  path: string;
  title: string;
  description: string;
  content: string;
}

const ARTICLES_DIR = path.join(process.cwd(), 'content/articles');

// Map of incomplete descriptions to smart completions based on article context
const completionMap: { [key: string]: string } = {
  'ai-and-web3-engineering-careers.md': 'Explore how artificial intelligence and machine learning are reshaping Web3 engineering roles, with insights on high-demand skills and career trajectories.',
  'avalanche-blockchain-platform-and-its-unique-features.md': 'Discover how Avalanche enables high-speed, low-cost transactions on DeFi and Web3 applications.',
  'best-programming-languages-for-blockchain-development.md': 'Compare Solidity, Rust, and Python, and learn which languages are most in-demand for blockchain development.',
  'bitcoin-whitepaper-day.md': 'Celebrate the anniversary of Satoshi Nakamoto\'s revolutionary Bitcoin whitepaper and its impact on decentralization and crypto.',
  'common-take-home-assignments-for-web3-developer-roles.md': 'Review typical smart contract and dApp development assignments used in Web3 hiring processes.',
  'developer-activity-slowdown.md': 'Analyze why developer activity declined after the 2021 bull run, and what it means for Web3 hiring.',
  'emerging-career-opportunities-in-web3-real-estate.md': 'Explore how blockchain and tokenization are creating new roles in property ownership and real estate markets.',
  'engineering-management-career-track.md': 'Navigate the transition from IC to manager, managing skill shifts, communication, and team dynamics.',
  'entry-level-jobs-in-web3.md': 'Find entry-level Web3 roles that require technical skills and passion for blockchain.',
  'how-to-build-credibility-in-new-role.md': 'Build trust through demonstrated competence and consistent delivery in your new position.',
  'how-to-evaluate-company-culture.md': 'Use targeted interview questions and observations to assess cultural fit before joining.',
  'how-to-get-a-web3-job-with-no-experience.md': 'Break into Web3 by building projects, learning core blockchain skills, and networking authentically.',
  'how-to-price-your-services-as-a-freelancer-or-employee.md': 'Calculate competitive rates based on experience, specialization, and market demand.',
  'is-a-career-in-web3-right-for-you.md': 'Assess whether Web3 aligns with your technical skills, personality, and long-term career goals.',
  'how-solana-crypto-supports-the-growth-of-web3.md': 'Learn how Solana\'s speed and affordability enable NFTs, DeFi, and consumer applications.',
  'mark-zuckerberg-on-web3.md': 'Review Meta\'s metaverse strategy and Zuckerberg\'s perspective on decentralization and Web3.',
  'marketing-strategy.md': 'Develop effective marketing campaigns using data analytics, community engagement, and meme-onomics.',
  'most-demanding-programming-skill.md': 'Identify the highest-value programming skills in today\'s tech and Web3 job markets.',
  'performance-management-best-practices.md': 'Set clear expectations, provide feedback, and maintain team alignment and motivation.',
  'self-sovereign-identity-in-web3-explained.md': 'Understand how DIDs and self-sovereign identity give users control over their digital credentials.',
  'startup-vs-corporate-career-comparison.md': 'Compare growth potential, compensation, work-life balance, and career stability.',
  'the-best-web3-job-boards-to-kickstart-your-crypto-career.md': 'Discover top platforms for finding Web3 jobs across product, engineering, and operations roles.',
  'the-most-rewarding-web3-careers.md': 'Find roles that align with your values, offer financial upside, and create positive impact.',
  'understanding-edge-ai-technology.md': 'Learn how edge AI processes data locally for faster, more efficient machine learning.',
  'understanding-elon-musks-web3-stance.md': 'Examine Elon Musk\'s skeptical yet evolving views on blockchain and decentralized technology.',
  'understanding-nanotechnology-basics.md': 'Explore nanoscale engineering and its applications across medicine, materials science, and manufacturing.',
  'understanding-the-solana-blockchain.md': 'Understand Solana\'s architecture, advantages, and ecosystem for DeFi and Web3 applications.',
  'web3-for-good-careers-in-social-impact-daos.md': 'Build a career creating positive change through research, community building, and impact-focused protocols.',
  'web3-ux-design.md': 'Master wallet design, transaction flows, and accessibility patterns unique to decentralized applications.',
  'what-is-avalanche.md': 'Explore the Avalanche consensus mechanism and how it powers fast, scalable DeFi.',
  'what-is-desci.md': 'Discover how blockchain is decentralizing scientific research and creating new funding models.',
  'what-is-frontrunning-in-defi-trading.md': 'Learn how frontrunning works in DEX trading and strategies to protect against it.',
  'what-makes-crypto-a-key-part-of-web3.md': 'Understand the essential role of cryptocurrencies and tokens in decentralized systems.',
  'why-web3-adoption-is-slow.md': 'Analyze regulatory, technical, and user experience barriers to mainstream Web3 adoption.',
  'web3-jobs-in-boston.md': 'Explore Boston\'s unique tech ecosystem and Web3 job opportunities in a startup hub.',
  'web3-jobs-in-canada.md': 'Discover Web3 career opportunities in Toronto, Vancouver, and other Canadian tech hubs.',
  'web3-jobs-in-india.md': 'Explore India\'s growing Web3 talent market and remote opportunities for developers.',
  'web3-jobs-in-jaipur.md': 'Find Web3 and tech jobs in Jaipur\'s emerging startup scene.',
  'web3-jobs-in-lilongwe.md': 'Discover Web3 and tech career opportunities in Lilongwe and Malawi.',
  'web3-jobs-in-lome.md': 'Explore Web3 jobs and tech careers in Lome, Togo.',
  'web3-jobs-in-mumbai.md': 'Find Web3 and blockchain careers in Mumbai, India\'s crypto hub.',
  'web3-jobs-in-nairobi.md': 'Discover Web3 and fintech job opportunities in Nairobi\'s tech ecosystem.',
  'web3-jobs-in-seattle.md': 'Explore Seattle\'s unique mix of Web3 startups, fintech, and enterprise blockchain.',
};

async function getArticleContent(filePath: string): Promise<ArticleFile | null> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let inFrontmatter = false;
    let frontmatterEnd = 0;
    const frontmatterLines: string[] = [];
    
    // Extract frontmatter
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        if (!inFrontmatter) {
          inFrontmatter = true;
        } else {
          frontmatterEnd = i;
          break;
        }
      } else if (inFrontmatter) {
        frontmatterLines.push(lines[i]);
      }
    }
    
    // Parse YAML-like frontmatter
    let title = '';
    let description = '';
    
    for (const line of frontmatterLines) {
      if (line.startsWith('title:')) {
        title = line.replace('title:', '').trim().replace(/^["']|["']$/g, '');
      }
      if (line.startsWith('description:')) {
        description = line.replace('description:', '').trim().replace(/^["']|["']$/g, '');
      }
    }
    
    return {
      path: filePath,
      title,
      description,
      content,
    };
  } catch (error) {
    return null;
  }
}

async function fixIncompleteDescriptions() {
  console.log('🔍 Scanning articles for incomplete descriptions...\n');
  
  const files = fs.readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(ARTICLES_DIR, f));
  
  let fixed = 0;
  const updates: { file: string; oldDesc: string; newDesc: string }[] = [];
  
  for (const file of files) {
    const article = await getArticleContent(file);
    if (!article) continue;
    
    const fileName = path.basename(file);
    
    // Check if description ends with "and."
    if (article.description.trim().endsWith('and.')) {
      const newDescription = completionMap[fileName] || 
        `${article.description.substring(0, article.description.length - 5)}ongoing developments in the Web3 space.`;
      
      console.log(`📝 Fixing: ${fileName}`);
      console.log(`   Old: "${article.description}"`);
      console.log(`   New: "${newDescription}"\n`);
      
      updates.push({
        file,
        oldDesc: article.description,
        newDesc: newDescription,
      });
      
      fixed++;
    }
  }
  
  if (updates.length === 0) {
    console.log('✅ No incomplete descriptions found!\n');
    return;
  }
  
  console.log(`\n⏳ Applying fixes to ${updates.length} articles...\n`);
  
  // Apply all updates
  for (const update of updates) {
    const content = fs.readFileSync(update.file, 'utf-8');
    const oldLine = `description: "${update.oldDesc}"`;
    const newLine = `description: "${update.newDesc}"`;
    const newContent = content.replace(oldLine, newLine);
    fs.writeFileSync(update.file, newContent, 'utf-8');
  }
  
  console.log(`✅ Fixed ${fixed} articles with incomplete descriptions\n`);
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Total fixed: ${fixed}`);
  console.log(`   Articles scanned: ${files.length}`);
  console.log(`   Success rate: ${((fixed / files.length) * 100).toFixed(1)}%\n`);
}

fixIncompleteDescriptions().catch(console.error);
