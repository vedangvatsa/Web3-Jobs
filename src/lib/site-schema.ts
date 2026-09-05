const siteUrl = 'https://hashtagweb3.com';

export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Hashtag Web3 Talent Intelligence & Career Platform',
  serviceType: 'Web3 Job Board and Career Intelligence',
  provider: {
    '@type': 'Organization',
    name: 'Hashtag Web3',
    url: siteUrl,
  },
  areaServed: 'Worldwide',
  description:
    'Verified Web3 job postings, developer career playbooks, compensation calculators, blockchain glossary, and developer APIs.',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Web3 Career & Intelligence Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Web3 Job Search & Verification',
          description:
            'Curated and verified Web3 job listings from top protocols, DAOs, and crypto startups.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Developer APIs & Agent Tool Calling',
          description:
            'High-performance REST endpoints and Model Context Protocol (MCP) servers for AI agents.',
        },
      },
    ],
  },
};

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Hashtag Web3?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Hashtag Web3 is the premier Web3 job board, blockchain career resource platform, and decentralized talent intelligence network connecting builders with verified blockchain, DeFi, and crypto opportunities.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are the jobs on Hashtag Web3 verified?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, every job listed on Hashtag Web3 is verified against official employer career portals, ATS systems, and authentic Web3 protocol repositories to eliminate scam and duplicate postings.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Hashtag Web3 provide developer APIs and MCP servers for AI agents?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Hashtag Web3 provides public REST endpoints (GET /api/v1/jobs, /api/v1/glossary, /api/v1/events, /api/v1/news), OpenAPI 3.1 specifications, and a Streamable HTTP Model Context Protocol (MCP) server at /.well-known/mcp.',
      },
    },
  ],
};

export const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: siteUrl,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Jobs',
      item: `${siteUrl}/jobs`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Developers',
      item: `${siteUrl}/developers`,
    },
    {
      '@type': 'ListItem',
      position: 4,
      name: 'Glossary',
      item: `${siteUrl}/glossary`,
    },
  ],
};
