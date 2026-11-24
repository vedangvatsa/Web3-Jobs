#!/usr/bin/env tsx
import assert from 'node:assert/strict';
import type { GrantProgram } from '../src/types';
import { formatGrantDetailSubtitle } from '../src/lib/grant-subtitle';

const aave = {
  name: 'Aave Grants',
  provider: 'Aave',
  category: 'Web3 Ecosystem',
  ecosystem: 'Aave',
  type: 'Grant',
} as GrantProgram;

assert.equal(formatGrantDetailSubtitle(aave), 'Web3 Ecosystem · Aave · Grant');

const distinct = {
  name: 'Base Builder Grant',
  provider: 'Coinbase',
  category: 'Web3 Ecosystem',
  ecosystem: 'Base',
  type: 'Grant',
} as GrantProgram;

assert.equal(formatGrantDetailSubtitle(distinct), 'Coinbase · Web3 Ecosystem · Base · Grant');

const credit = {
  name: 'AWS Activate',
  provider: 'Amazon Web Services',
  category: 'Cloud & AI Credits',
  ecosystem: 'Global',
  type: 'Credit / Perk',
} as GrantProgram;

assert.equal(
  formatGrantDetailSubtitle(credit),
  'Amazon Web Services · Cloud & AI Credits · Credit / Perk',
);

console.log('grant-subtitle regression passed');