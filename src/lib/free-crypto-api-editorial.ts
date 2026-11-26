import type { FreeCryptoApiListing } from '@/types';
import type { EventEditorialArticle } from '@/lib/events';

export interface FreeCryptoApiEditorial {
  summaryLead: string;
  sections: Array<{
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  }>;
  keyHighlights: Array<{ label: string; value: string }>;
}

export function generateCryptoApiEditorial(listing: FreeCryptoApiListing): FreeCryptoApiEditorial {
  const categoryLabel = listing.categoryLabel || listing.category;
  const alsoServesStr = listing.alsoServes?.length
    ? ` In addition to core ${categoryLabel.toLowerCase()} services, the platform also provides ${listing.alsoServes.join(', ')} capabilities.`
    : '';

  const summaryLead = `${listing.name} is a Web3 ${categoryLabel.toLowerCase()} infrastructure provider offering public developer endpoints.${alsoServesStr} Free-tier access includes: ${listing.freeTier}`;

  const sections: FreeCryptoApiEditorial['sections'] = [];

  // 1. Free Tier & Quotas
  const freeTierParagraphs: string[] = [
    `Developers integrating ${listing.name} receive access under the documented free tier: "${listing.freeTier}".`,
  ];
  if (listing.notes) {
    freeTierParagraphs.push(listing.notes);
  }
  const freeTierBullets: string[] = [];
  if (listing.keyRequired) {
    freeTierBullets.push(`API Key Required: ${listing.keyRequired === 'yes' ? 'Yes (registration required)' : 'No (direct public access)'}`);
  }
  if (listing.cardRequired) {
    freeTierBullets.push(`Credit Card Required: ${listing.cardRequired === 'yes' ? 'Yes' : 'No credit card needed to get started'}`);
  }
  if (listing.freePath) {
    const pathText =
      listing.freePath === 'ongoing' ? 'Ongoing free tier available for active builders' :
      listing.freePath === 'keyless' ? 'Keyless direct endpoint without registration' :
      listing.freePath === 'trial' ? 'Time-limited developer trial' :
      listing.freePath === 'paid' ? 'Paid plans with entry credits' :
      'Community access path';
    freeTierBullets.push(`Access Model: ${pathText}`);
  }

  sections.push({
    heading: 'Free-tier quotas & access requirements',
    paragraphs: freeTierParagraphs,
    bullets: freeTierBullets.length ? freeTierBullets : undefined,
  });

  // 2. Protocols, Transports & Supported Chains
  const protocolParagraphs: string[] = [];
  const protocolBullets: string[] = [];

  if (listing.chains) {
    protocolParagraphs.push(`The service supports multi-chain and ecosystem interactions across ${listing.chains}.`);
  }
  if (listing.chainList?.length) {
    const previewChains = listing.chainList.slice(0, 12).join(', ');
    const remaining = listing.chainList.length > 12 ? ` and ${listing.chainList.length - 12} other networks` : '';
    protocolBullets.push(`Supported Blockchains: ${previewChains}${remaining}`);
  }
  if (listing.transports) {
    if (listing.transports.rest) {
      protocolBullets.push(`REST Transport: ${listing.transports.rest.status.toUpperCase()}${listing.transports.rest.notes ? ` — ${listing.transports.rest.notes}` : ''}`);
    }
    if (listing.transports.websocket) {
      protocolBullets.push(`WebSocket Transport: ${listing.transports.websocket.status.toUpperCase()}${listing.transports.websocket.notes ? ` — ${listing.transports.websocket.notes}` : ''}`);
    }
  }

  if (protocolParagraphs.length || protocolBullets.length) {
    sections.push({
      heading: 'Network coverage & protocol transports',
      paragraphs: protocolParagraphs.length ? protocolParagraphs : [`${listing.name} exposes standardized connectivity for decentralized application builders.`],
      bullets: protocolBullets.length ? protocolBullets : undefined,
    });
  }

  // 3. AI Agent & Programmatic Integration (MCP / x402)
  if (listing.mcp?.status === 'yes' || listing.x402?.status === 'yes') {
    const agentParagraphs: string[] = [
      `${listing.name} supports modern programmatic integrations and automated agent toolchains for autonomous Web3 execution.`,
    ];
    const agentBullets: string[] = [];
    if (listing.mcp?.status === 'yes') {
      agentBullets.push(`Model Context Protocol (MCP): Official MCP server supported for Claude, Antigravity, and autonomous agent environments.`);
    }
    if (listing.x402?.status === 'yes') {
      agentBullets.push(`x402 Pay-Per-Call: Native pay-as-you-go micropayments enabled${listing.x402.notes ? ` (${listing.x402.notes})` : ''}.`);
    }

    sections.push({
      heading: 'AI agent & autonomous toolchain support',
      paragraphs: agentParagraphs,
      bullets: agentBullets,
    });
  }

  // 4. Getting Started & Integration Steps
  sections.push({
    heading: 'Getting started & developer resources',
    paragraphs: [
      `To integrate ${listing.name} into your dApp, backend service, or autonomous agent workflow, visit the official developer documentation and endpoint dashboards.`,
      `Verify production rate limits and contract SLAs directly against the provider documentation before deploying high-throughput contracts or user-facing applications.`,
    ],
  });

  const keyHighlights = [
    { label: 'Category', value: categoryLabel },
    { label: 'Free Tier', value: listing.freeTier },
    { label: 'API Key', value: listing.keyRequired === 'yes' ? 'Required' : 'Keyless' },
    { label: 'Credit Card', value: listing.cardRequired === 'yes' ? 'Required' : 'Not required' },
    { label: 'MCP Support', value: listing.mcp?.status === 'yes' ? 'Supported' : 'No' },
    { label: 'x402 Micropayments', value: listing.x402?.status === 'yes' ? 'Supported' : 'No' },
  ];

  return {
    summaryLead,
    sections,
    keyHighlights,
  };
}

export function cryptoApiEditorialToEventArticle(editorial: FreeCryptoApiEditorial): EventEditorialArticle {
  return {
    summaryLead: editorial.summaryLead,
    sections: editorial.sections.map((section) => ({
      heading: section.heading,
      content: [
        ...section.paragraphs,
        ...(section.bullets?.length
          ? [section.bullets.map((item) => `• ${item}`).join('\n')]
          : []),
      ],
    })),
    descriptionStatus: 'source-backed',
  };
}
