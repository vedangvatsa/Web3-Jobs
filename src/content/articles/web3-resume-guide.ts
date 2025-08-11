
import type { Article } from '@/types';

export const article: Article = {
    slug: 'web3-resume-guide',
    title: 'How to Build a Web3 Resume That Gets You Hired',
    image: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=600&h=400&auto=format&fit=crop',
    description: 'A practical guide to creating a standout Web3 resume. Learn how to showcase your projects, skills, and on-chain activity to land your dream job.',
    content: [
      { type: 'p', children: [{ type: 'text', value: 'In the Web3 world, your resume is more than just a document—it\'s a collection of your public work, contributions, and on-chain activity. While a traditional PDF resume is still often required, it serves a different purpose. It\'s a guide that points recruiters to the most important evidence of your skills: your projects, your GitHub, and your public engagement.' }] },
      { type: 'p', children: [{ type: 'text', value: 'Forget everything you know about corporate resume-building. No one cares about your \'strong work ethic\' or \'team player\' skills. They care about what you\'ve built, what you\'ve contributed to, and what you know. This guide will show you how to structure your resume to highlight the things that actually matter to Web3 recruiters.' }] },
      { type: 'blockquote', children: [{ type: 'p', children: [{ type: 'text', value: 'Your resume is the trailer, but your portfolio is the movie. Make sure your resume makes them want to watch.', style: 'italic' }] }] },
      { type: 'h2', children: [{ type: 'text', value: 'The Core Components of a Web3 Resume' }] },
      { type: 'h3', children: [{ type: 'text', value: '1. The "Holy Trinity" of Links' }] },
      { type: 'p', children: [{ type: 'text', value: 'These three links should be at the very top of your resume, right under your name. They are non-negotiable. If a recruiter has to hunt for these, you\'ve already lost.' }] },
      { type: 'ul', children: [
        { type: 'li', children: [{ type: 'text', value: 'GitHub: This is the single most important part of your application for any technical role. It should be clean, organized, and feature your best projects pinned to the top. Your commit history is proof of your work.' }] },
        { type: 'li', children: [{ type: 'text', value: 'Twitter (X): This is your public persona in the Web3 world. It shows you\'re engaged in the conversation and have a point of view. Recruiters will absolutely look at your Twitter profile to gauge your passion and communication style.' }] },
        { type: 'li', children: [{ type: 'text', value: 'Personal Website/Portfolio: This is your chance to tie everything together. It should have a brief bio, a section for your best projects (with live links and source code), and links to any content you\'ve created (blog posts, etc.).' }] },
      ]},
      { type: 'h3', children: [{ type: 'text', value: '2. Skills Section: Keywords are Key' }] },
      { type: 'p', children: [{ type: 'text', value: 'Be specific and use the keywords that recruiters are searching for. Don\'t just say \'JavaScript\'; say \'React, Next.js, TypeScript, Ethers.js\'. Organize your skills into logical categories.' }] },
      { type: 'ul', children: [
        { type: 'li', children: [{ type: 'text', value: 'Languages: Solidity, Rust, Go, TypeScript, Python' }] },
        { type: 'li', children: [{ type: 'text', value: 'Technologies: Ethereum, Solana, EVM, Foundry, Hardhat, The Graph, IPFS' }] },
        { type: 'li', children: [{ type: 'text', value: 'Libraries: Ethers.js, Viem, Wagmi, RainbowKit, OpenZeppelin Contracts' }] },
      ]},
      { type: 'h3', children: [{ type: 'text', value: '3. Projects Section: Show, Don\'t Tell' }] },
      { type: 'p', children: [{ type: 'text', value: 'This is the most important section of your resume. It\'s far more important than your work experience, especially if you\'re new to the space. For each project, you should have:' }] },
      { type: 'ul', children: [
        { type: 'li', children: [{ type: 'text', value: 'Project Name & Links: Provide a link to the live demo and the GitHub repository.' }] },
        { type: 'li', children: [{ type: 'text', value: 'Tech Stack: List the key technologies you used.' }] },
        { type: 'li', children: [{ type: 'text', value: 'Description: Write one or two sentences explaining what the project is and what problem it solves.' }] },
        { type: 'li', children: [{ type: 'text', value: 'Your Contributions: Use 2-3 bullet points to describe exactly what *you* did. Use action verbs. Instead of \'Worked on a DeFi protocol,\' say \'Developed and tested the core smart contracts for a lending protocol using Foundry, achieving 95% test coverage.\'' }] },
      ]},
      { type: 'h3', children: [{ type: 'text', value: '4. Contributions & Public Activity' }] },
      { type: 'p', children: [{ type: 'text', value: 'This section is unique to Web3 and can really make you stand out. It shows you\'re an active participant in the ecosystem.' }] },
      { type: 'ul', children: [
        { type: 'li', children: [{ type: 'text', value: 'DAO Contributions: List any DAOs you are an active member of. Mention any proposals you\'ve voted on, discussions you\'ve participated in, or bounties you\'ve completed. This is crucial for roles in ' }, { type: 'link', href: '/articles/dao-governance-career-guide', value: 'DAO governance' }, { type: 'text', value: '.' }] },
        { type: 'li', children: [{ type: 'text', value: 'Open-Source Contributions: Link to any pull requests you\'ve had merged into open-source projects.' }] },
        { type: 'li', children: [{ type: 'text', value: 'Hackathons & Auditing Contests: Mention any hackathons (e.g., ETHGlobal) or competitive auditing contests (e.g., Code4rena) you\'ve participated in, and what you built or found.' }] },
      ]},
      { type: 'h2', children: [{ type: 'text', value: 'What to Leave Out' }] },
      { type: 'ul', children: [
        { type: 'li', children: [{ type: 'text', value: 'Objective Statement: It\'s fluff. They know your objective is to get a job.' }] },
        { type: 'li', children: [{ type: 'text', value: 'Soft Skills: Don\'t list things like \'Team Player\' or \'Hard Worker\'. Demonstrate these qualities through your project descriptions and contributions.' }] },
        { type: 'li', children: [{ type: 'text', value: 'Irrelevant Experience: Your summer job as a lifeguard probably isn\'t relevant unless you can tie it to a key skill (e.g., responsibility, risk assessment).' }] },
      ]},
      {
        type: 'h2',
        children: [{ type: 'text', value: 'Stay Ahead in Web3' }],
      },
      {
        type: 'p',
        children: [
          { type: 'text', value: 'Don\'t miss the latest opportunities. ' },
          { type: 'link', href: 'https://t.me/web3hiring', value: 'Subscribe to our Telegram channel for Web3 jobs' },
          { type: 'text', value: ' and get the best roles delivered directly to you.' },
        ],
      },
    ]
};
