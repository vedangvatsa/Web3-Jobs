import assert from 'node:assert/strict';
import { test } from 'node:test';
import { displayJobTitle } from '../src/lib/display-job-title';

test('drops a team clause when the role is already specific', () => {
  assert.equal(displayJobTitle('Senior Analyst, Controls and Governance'), 'Senior Analyst');
  assert.equal(displayJobTitle('Senior Software Engineer, Smart Order Router'), 'Senior Software Engineer');
  assert.equal(displayJobTitle('Head of Marketing, 0x & Matcha'), 'Head of Marketing');
  assert.equal(displayJobTitle('Research Intern, Summer 2027'), 'Research Intern');
  assert.equal(displayJobTitle('Software Engineer, Software Factory'), 'Software Engineer');
  assert.equal(displayJobTitle('Senior Marketing Manager, APAC'), 'Senior Marketing Manager');
  assert.equal(displayJobTitle('Head of Renewals, EMEA & APAC'), 'Head of Renewals');
  assert.equal(displayJobTitle('Sales Manager, Europe, Enterprise Platforms'), 'Sales Manager');
  assert.equal(displayJobTitle('[EU] Business Development Specialist,Mini EU'), '[EU] Business Development Specialist');
});

test('keeps a specialty that sits after the comma', () => {
  assert.equal(displayJobTitle('Analyst, Client Management'), 'Analyst, Client Management');
  assert.equal(displayJobTitle('Director, OT Security'), 'Director, OT Security');
  assert.equal(displayJobTitle('Director, Digital Trust and Resilience'), 'Director, Digital Trust and Resilience');
  assert.equal(displayJobTitle('VP, Finance'), 'VP, Finance');
  assert.equal(displayJobTitle('VP, Finance Engineering - Mumbai'), 'VP, Finance Engineering');
  assert.equal(displayJobTitle('Manager, Enterprise Sales - UK'), 'Manager, Enterprise Sales');
  assert.equal(displayJobTitle('Director, Customer Partner Success - Remote'), 'Director, Customer Partner Success');
  assert.equal(displayJobTitle('Staff Engineer, Machine Learning & Data Infrastructure'), 'Staff Engineer, Machine Learning & Data Infrastructure');
  assert.equal(displayJobTitle('Quality Engineering Manager, Hardware'), 'Quality Engineering Manager, Hardware');
  assert.equal(displayJobTitle('Research Engineer, Agentic Systems'), 'Research Engineer, Agentic Systems');
  assert.equal(displayJobTitle('Specialist, Talent Acquisition (Technology)'), 'Specialist, Talent Acquisition');
  assert.equal(displayJobTitle('VP, Compliance (Global Financial Intelligence Unit)'), 'VP, Compliance');
  assert.equal(displayJobTitle('Senior Associate, Fraud Operations'), 'Senior Associate, Fraud Operations');
  assert.equal(displayJobTitle('Software Engineer, Backend, AI Ventures'), 'Software Engineer, Backend');
  assert.equal(displayJobTitle('Senior Staff, Developer Relations'), 'Senior Staff, Developer Relations');
  assert.equal(displayJobTitle('Senior Counsel, Product & Data'), 'Senior Counsel, Product & Data');
  assert.equal(displayJobTitle('Senior Counsel, Corporate & M&A'), 'Senior Counsel, Corporate & M&A');
});

test('never drops the rank, the employment type, or a second title', () => {
  assert.equal(displayJobTitle('Revenue Operations, Senior Manager'), 'Revenue Operations, Senior Manager');
  assert.equal(displayJobTitle('Director, Customer Partner Success'), 'Director, Customer Partner Success');
  assert.equal(displayJobTitle('Director, Partner Management, Americas'), 'Director, Partner Management');
  assert.equal(displayJobTitle('VP, Data Engineer (KDB Developer)'), 'VP, Data Engineer');
  assert.equal(displayJobTitle('PhD Machine Learning Engineer, Intern'), 'PhD Machine Learning Engineer, Intern');
  assert.equal(displayJobTitle('Electrical Engineer, Partner'), 'Electrical Engineer, Partner');
  assert.equal(displayJobTitle('President, Bitstamp Europe'), 'President, Bitstamp Europe');
  assert.equal(displayJobTitle('Contractor, Workplace Experience Coordinator, New York City'), 'Contractor, Workplace Experience Coordinator');
  assert.equal(displayJobTitle('Compliance Officer, Risk Officer and MLRO(Canada and US)'), 'Compliance Officer, Risk Officer and MLRO');
  assert.equal(displayJobTitle('Head of EEA Legal, Deputy General Counsel'), 'Head of EEA Legal, Deputy General Counsel');
  assert.equal(displayJobTitle('Senior Manager, HR Business Partner, G&A'), 'Senior Manager, HR Business Partner');
});

test('does not reorder words or split a comma list', () => {
  assert.equal(displayJobTitle('Lead: AML, CTF, CPF & Sanctions'), 'Lead: AML, CTF, CPF & Sanctions');
  assert.equal(displayJobTitle('Associate General Counsel, Regulatory, Product & Litigation'), 'Associate General Counsel, Regulatory, Product & Litigation');
  assert.equal(displayJobTitle('Software Engineer, Wallets, Liquidity and Bridging Team'), 'Software Engineer, Wallets, Liquidity and Bridging Team');
  assert.equal(displayJobTitle('Account Executive - Travel, Ticketing & Hospitality (Hunter)'), 'Account Executive - Travel, Ticketing & Hospitality (Hunter)');
  assert.equal(displayJobTitle('Global Customer Marketing, Advocacy & Communities Manager'), 'Global Customer Marketing, Advocacy & Communities Manager');
  assert.equal(displayJobTitle('Director of Enterprise Sales, Wealth, FIs & Brokerage - EMEA'), 'Director of Enterprise Sales, Wealth, FIs & Brokerage - EMEA');
});

test('leaves titles without a comma clause unchanged', () => {
  assert.equal(displayJobTitle('Software Engineer'), 'Software Engineer');
  assert.equal(displayJobTitle('2027 Site Reliability Engineer Intern-Afton, Texas'), 'Site Reliability Engineer Intern');
  assert.equal(displayJobTitle('2027 Construction Intern-Afton, Texas'), 'Construction Intern');
  assert.equal(displayJobTitle('2027 Research Intern - NYC'), 'Research Intern - NYC');
  assert.equal(displayJobTitle('Account Executive - Startups & AI (Korean Speaking, Singapore based)'), 'Account Executive - Startups & AI (Korean Speaking, Singapore based)');
  assert.equal(displayJobTitle(''), '');
});
