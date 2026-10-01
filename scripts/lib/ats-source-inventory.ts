import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { atsBoardKey, getAtsBoardFromUrl, getJobAtsBoards, type AtsBoard } from '../../src/lib/ats-board-identity';

export type ConfiguredAtsBoard = AtsBoard & { company: string; file: string; url?: string };
export type AtsInventoryEntry = AtsBoard & { companies: string[]; files: string[]; jobs: number; sampleLink?: string; url?: string };

function scriptFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return ['logs', 'output', 'node_modules'].includes(entry.name) ? [] : scriptFiles(file);
    return /\.(?:ts|mjs|js)$/.test(entry.name) && !/^(?:test-|audit-)/.test(entry.name) ? [file] : [];
  });
}

function providerFromHint(hint: string): string | undefined {
  return ['ashby', 'greenhouse', 'lever', 'workable', 'recruitee', 'bamboo', 'breezy', 'smartrecruiters', 'teamtailor', 'rippling', 'dover', 'comeet'].find(provider => hint.includes(provider))?.replace(/^bamboo$/, 'bamboohr');
}

export function configuredAtsBoards(): ConfiguredAtsBoard[] {
  const boards: ConfiguredAtsBoard[] = [];
  for (const file of scriptFiles('scripts')) {
    const source = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);
    function visit(node: ts.Node) {
      if (ts.isObjectLiteralExpression(node)) {
        const values: Record<string, string> = {};
        for (const property of node.properties) {
          if (ts.isPropertyAssignment(property) && (ts.isStringLiteral(property.initializer) || ts.isNoSubstitutionTemplateLiteral(property.initializer))) {
            values[property.name.getText(source).replace(/['"]/g, '')] = property.initializer.text;
          }
        }
        const company = values.company, board = values.board || values.slug;
        if (company && board) {
          let parent: ts.Node | undefined = node;
          while (parent && !ts.isVariableDeclaration(parent)) parent = parent.parent;
          const variable = parent && ts.isVariableDeclaration(parent) ? parent.name.getText(source) : '';
          const provider = providerFromHint(`${values.type || ''} ${values.url || ''} ${variable}`.toLowerCase());
          if (provider) boards.push({ provider, board: board.replace(/^eu:/, ''), company, file, url: values.url, ...(/eu:|\.eu\./.test(`${board} ${values.apiHost} ${values.url}`) && { region: 'eu' as const }) });
        }
      } else if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && /^ingest(?:AshbySimple|Greenhouse|Lever|BambooHR)$/.test(node.expression.text)) {
        const [company, board] = node.arguments;
        if (company && board && ts.isStringLiteral(company) && ts.isStringLiteral(board)) {
          boards.push({ provider: providerFromHint(node.expression.text.toLowerCase())!, board: board.text.replace(/^eu:/, ''), company: company.text, file, ...(board.text.startsWith('eu:') && { region: 'eu' as const }) });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  for (const name of fs.readdirSync('.github/workflows').filter(file => /\.ya?ml$/.test(file))) {
    const file = `.github/workflows/${name}`;
    for (const match of fs.readFileSync(file, 'utf8').matchAll(/ingest-(ashby|greenhouse)-board\.ts\s+(\S+)\s+["']([^"']+)["']/g)) {
      boards.push({ provider: match[1], board: match[2], company: match[3], file });
    }
  }
  return boards;
}

export function atsSourceInventory(): AtsInventoryEntry[] {
  const boards = new Map<string, AtsInventoryEntry>();
  function add(input: ConfiguredAtsBoard, jobs = 0, sampleLink?: string) {
    const key = atsBoardKey(input.provider, input.board);
    const entry = boards.get(key) || { provider: input.provider, board: decodeURIComponent(input.board), companies: [], files: [], jobs: 0 };
    if (!entry.companies.includes(input.company)) entry.companies.push(input.company);
    if (!entry.files.includes(input.file)) entry.files.push(input.file);
    if (input.region) entry.region = input.region;
    if (input.url) entry.url = input.url;
    if (sampleLink && !entry.sampleLink) entry.sampleLink = sampleLink;
    entry.jobs += jobs;
    boards.set(key, entry);
  }
  configuredAtsBoards().forEach(board => add(board));
  const jobs = JSON.parse(fs.readFileSync('content/jobs-cache.json', 'utf8')) as Array<{ company: string; link: string; source?: string }>;
  for (const job of jobs) {
    const linkBoard = getAtsBoardFromUrl(job.link);
    const board = linkBoard || getJobAtsBoards(job)[0];
    if (board) add({ ...board, company: job.company, file: 'content/jobs-cache.json' }, 1, job.link);
  }
  return [...boards.values()].sort((a, b) => b.jobs - a.jobs || atsBoardKey(a.provider, a.board).localeCompare(atsBoardKey(b.provider, b.board)));
}
