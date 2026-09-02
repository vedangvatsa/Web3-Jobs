import { NextRequest, NextResponse } from 'next/server';

const MOCK_SANDBOX_GLOSSARY = [
  {
    term: 'Zero-Knowledge Proof (ZK-Proof)',
    slug: 'zero-knowledge-proof',
    category: 'Cryptography',
    description: 'A cryptographic method enabling one party to prove to another that a statement is true without revealing any information beyond the validity of the statement itself.',
    isSandbox: true,
  },
  {
    term: 'Automated Market Maker (AMM)',
    slug: 'automated-market-maker',
    category: 'DeFi',
    description: 'A decentralized exchange protocol that uses algorithmic pricing mechanisms and liquidity pools instead of traditional order books.',
    isSandbox: true,
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').toLowerCase().trim();

  let terms = MOCK_SANDBOX_GLOSSARY;
  if (search) {
    terms = terms.filter(t => t.term.toLowerCase().includes(search) || t.description.toLowerCase().includes(search));
  }

  return NextResponse.json(
    {
      environment: 'sandbox',
      total: terms.length,
      count: terms.length,
      terms,
      message: 'Sandbox mock glossary response. Safe for automated agent testing.',
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
