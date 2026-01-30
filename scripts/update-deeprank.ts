#!/usr/bin/env node

/**
 * Script to update deeprank.json with all articles from content/articles/
 * Run with: npx tsx scripts/update-deeprank.ts
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

async function updateDeeprankJson() {
  const articlesDir = path.join(process.cwd(), 'content/articles');
  const deeprankPath = path.join(process.cwd(), 'deeprank.json');

  console.log('📝 Reading articles from content/articles/...');
  
  const files = await fs.readdir(articlesDir);
  const articleFiles = files.filter(f => f.endsWith('.md'));
  
  const articles = [];
  
  for (const file of articleFiles) {
    const filePath = path.join(articlesDir, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const { data } = matter(content);
    
    const slug = file.replace('.md', '');
    articles.push({
      type: 'Article',
      id: `/${slug}`,
      title: data.title || slug,
      description: data.description || 'Article about Web3 careers and technology',
      category: data.category || 'Web3 Career Guide',
      keywords: [data.category || 'web3', 'career', 'blockchain']
    });
  }
  
  console.log(`✅ Found ${articles.length} articles`);
  
  // Keep existing non-article entries
  const existingEntries = [
    {
      type: 'WebResource',
      id: '/interview-questions',
      title: 'Web3 Interview Question Bank',
      description: 'The ultimate resource for Web3 interview preparation. Explore hundreds of real questions for roles in Solidity, DeFi, Product Management, and more.',
      category: 'Career Tools',
      keywords: ['interview questions', 'web3', 'solidity', 'defi', 'hiring']
    },
    {
      type: 'WebResource',
      id: '/web3-career-quiz',
      title: 'Web3 Archetype Assessment',
      description: 'Take our quick assessment to discover your Web3 personality archetype and the career paths that match your skills and interests.',
      category: 'Career Tools',
      keywords: ['career quiz', 'web3', 'archetype', 'personality test']
    },
    {
      type: 'WebResource',
      id: '/salary-calculator',
      title: 'Web3 Salary Calculator',
      description: 'Estimate your salary in the Web3 industry based on your role, experience, and location.',
      category: 'Career Tools',
      keywords: ['salary calculator', 'web3 salary', 'crypto jobs', 'compensation']
    },
    {
      type: 'WebResource',
      id: '/resume-builder',
      title: 'Web3 Resume Builder',
      description: 'Create a professional, crypto-native resume that stands out to recruiters.',
      category: 'Career Tools',
      keywords: ['resume builder', 'web3 resume', 'cv', 'job application']
    },
    {
      type: 'WebResource',
      id: '/invoice-generator',
      title: 'Free Invoice Generator',
      description: 'A free and simple invoice generator for freelancers and contractors.',
      category: 'Freelancer Tools',
      keywords: ['invoice', 'freelance', 'contractor', 'payment']
    },
    {
      type: 'WebResource',
      id: '/digital-nomad-visas',
      title: 'Digital Nomad Visa List',
      description: 'A comprehensive, searchable list of digital nomad visas for Web3 professionals.',
      category: 'Remote Work',
      keywords: ['digital nomad', 'remote work', 'visa', 'travel']
    },
    {
      type: 'WebResource',
      id: '/jd-builder',
      title: 'Web3 Job Description Builder',
      description: 'Easily create professional job descriptions for Web3 roles to attract top talent.',
      category: 'Hiring Tools',
      keywords: ['job description', 'hiring', 'recruiting', 'web3 roles']
    },
    {
      type: 'Service',
      id: '/jobs',
      title: 'Web3 Job Board',
      description: 'The #1 Job Board for Web3, crypto, and blockchain roles. Discover exclusive opportunities at leading Web3 companies, DAOs, and crypto startups.',
      category: 'Careers',
      keywords: ['web3 jobs', 'crypto jobs', 'blockchain jobs', 'hiring']
    },
    {
      type: 'Service',
      id: '/news',
      title: 'Web3 News Feed',
      description: 'The latest news and headlines from the world of Web3, cryptocurrency, and blockchain technology, aggregated from top industry sources.',
      category: 'News',
      keywords: ['crypto news', 'web3 news', 'blockchain news', 'headlines']
    }
  ];
  
  const deeprankData = {
    version: '1.0',
    scope: 'https://hashtagweb3.com',
    entities: [...articles, ...existingEntries]
  };
  
  await fs.writeFile(deeprankPath, JSON.stringify(deeprankData, null, 2));
  
  console.log(`\n✅ Updated deeprank.json with ${deeprankData.entities.length} total entities`);
  console.log(`   - ${articles.length} articles`);
  console.log(`   - ${existingEntries.length} pages/resources`);
}

updateDeeprankJson().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
