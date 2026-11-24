import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shortenJobTitleForSocial } from '../../src/lib/social-share-constants.mjs';

test('shortens noisy ATS titles for social one-liners', () => {
  assert.equal(
    shortenJobTitleForSocial('Institutional Sales Associate, Crypto Ecosystem'),
    'Institutional Sales Associate',
  );
  assert.equal(
    shortenJobTitleForSocial('Solutions Architect, Onchain Compliance'),
    'Solutions Architect',
  );
  assert.equal(
    shortenJobTitleForSocial('Innovation Quant Developer Intern (DeFi/Corporate Development) - London'),
    'Quant Developer Intern',
  );
  assert.equal(
    shortenJobTitleForSocial('Trading | DeFi Trading Analyst | Dubai'),
    'DeFi Trading Analyst',
  );
  assert.equal(
    shortenJobTitleForSocial('Software Engineer, Tokenization'),
    'Software Engineer, Tokenization',
  );
  assert.equal(
    shortenJobTitleForSocial('Senior Software Engineer, Core Infra Systems'),
    'Senior Software Engineer, Core Infra Systems',
  );
  assert.equal(shortenJobTitleForSocial('KOL and Social Manager'), 'KOL and Social Manager');
  assert.equal(shortenJobTitleForSocial('Head of Tax Information Reporting'), 'Head of Tax Information Reporting');
});

test('handles common ATS patterns beyond the original examples', () => {
  assert.equal(shortenJobTitleForSocial('Solutions Architect | LATAM'), 'Solutions Architect');
  assert.equal(shortenJobTitleForSocial('MLRO - Mexico'), 'MLRO');
  assert.equal(
    shortenJobTitleForSocial('Senior Software Engineer - React Native - Consumer - Asian Markets'),
    'Senior Software Engineer - React Native',
  );
  assert.equal(
    shortenJobTitleForSocial('Senior Software Engineer - Mobile Backend'),
    'Senior Software Engineer - Mobile Backend',
  );
  assert.equal(shortenJobTitleForSocial('Growth Manager (APAC)'), 'Growth Manager');
  assert.equal(shortenJobTitleForSocial('[EU] Head of Marketing, EU'), 'Head of Marketing');
  assert.equal(shortenJobTitleForSocial('OEML - Senior Compliance Analyst'), 'Senior Compliance Analyst');
  assert.equal(shortenJobTitleForSocial('Intern, Business Intelligence'), 'Business Intelligence Intern');
  assert.equal(shortenJobTitleForSocial('Database Engineer Intern - Summer 2027'), 'Database Engineer Intern');
  assert.equal(shortenJobTitleForSocial('Startup Partnerships - Y Combinator'), 'Startup Partnerships');
  assert.equal(
    shortenJobTitleForSocial('Director / Senior Director, Relationship Management'),
    'Senior Director',
  );
  assert.equal(shortenJobTitleForSocial('Regulatory Compliance Officer, EU'), 'Regulatory Compliance Officer');
  assert.equal(shortenJobTitleForSocial('Quantitative Trader (D1 Liquidity)'), 'Quantitative Trader');
  assert.equal(shortenJobTitleForSocial('Director of Sales - RWA'), 'Director of Sales');
  assert.equal(shortenJobTitleForSocial('Mid-Market Account Executive, Commerce'), 'Mid-Market Account Executive');
  assert.equal(
    shortenJobTitleForSocial('Sr Product Manager - Virality, Referrals & KOL'),
    'Sr Product Manager',
  );
  assert.equal(
    shortenJobTitleForSocial('VP, Compliance (Global Financial Intelligence Unit)'),
    'VP, Compliance',
  );
  assert.equal(
    shortenJobTitleForSocial('Lead, Agentic Commerce (Product & GTM)'),
    'Lead, Agentic Commerce',
  );
  assert.equal(
    shortenJobTitleForSocial('Lead / Expert, Ecosystem Growth'),
    'Lead, Ecosystem Growth',
  );
});