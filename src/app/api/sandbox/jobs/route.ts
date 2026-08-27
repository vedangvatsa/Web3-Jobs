import { NextRequest, NextResponse } from 'next/server';

const MOCK_SANDBOX_JOBS = [
  {
    id: 'sandbox_job_001',
    title: 'Senior Solidity Smart Contract Engineer (Sandbox Test)',
    company: 'Demo Protocol Labs',
    location: 'Remote',
    type: 'Full-time',
    category: 'Engineering',
    department: 'Smart Contracts',
    salary: '$180,000 - $240,000 + 0.5% Token Grant',
    link: 'https://hashtagweb3.com/jobs/sandbox-solidity-engineer',
    tags: ['Solidity', 'Ethereum', 'DeFi', 'Security', 'Foundry'],
    date: '2026-08-28T00:00:00.000Z',
    isSandbox: true,
  },
  {
    id: 'sandbox_job_002',
    title: 'Rust Core Blockchain Protocol Developer (Sandbox Test)',
    company: 'NextGen Layer 1 Foundation',
    location: 'Remote / Singapore',
    type: 'Full-time',
    category: 'Engineering',
    department: 'Core Consensus',
    salary: '$200,000 - $275,000',
    link: 'https://hashtagweb3.com/jobs/sandbox-rust-developer',
    tags: ['Rust', 'Solana', 'Consensus', 'Zero Knowledge', 'P2P'],
    date: '2026-08-28T00:00:00.000Z',
    isSandbox: true,
  },
  {
    id: 'sandbox_job_003',
    title: 'ZK Cryptography & Security Auditor (Sandbox Test)',
    company: 'Verifiable Proofs Security',
    location: 'Remote / London',
    type: 'Full-time',
    category: 'Security',
    department: 'Audit & Research',
    salary: '$190,000 - $260,000',
    link: 'https://hashtagweb3.com/jobs/sandbox-zk-auditor',
    tags: ['Zero Knowledge', 'Circom', 'Halo2', 'Auditing'],
    date: '2026-08-28T00:00:00.000Z',
    isSandbox: true,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').toLowerCase().trim();
  const limit = Math.min(Math.max(Number(searchParams.get('limit')) || 20, 1), 100);

  let jobs = MOCK_SANDBOX_JOBS;
  if (search) {
    jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(search) ||
      j.company.toLowerCase().includes(search) ||
      j.tags.some(t => t.toLowerCase().includes(search))
    );
  }

  return NextResponse.json(
    {
      environment: 'sandbox',
      total: jobs.length,
      count: Math.min(jobs.length, limit),
      jobs: jobs.slice(0, limit),
      message: 'Sandbox mock jobs response. Safe for automated agent testing.',
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Environment': 'sandbox',
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    },
  });
}
