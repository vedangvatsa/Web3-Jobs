import fs from 'fs';
import path from 'path';
import { GET as getAgentView } from '../src/app/api/agent-view/route';
import { GET as getNotFoundMarkdown } from '../src/app/api/not-found-md/route';

const root = path.resolve(__dirname, '..');
const pluginPaths = [
  'plugin.json',
  'public/plugin.json',
  'public/.well-known/plugin.json',
  'public/.well-known/agent-plugin.json',
];
const allowedPluginFields = new Set([
  '$schema',
  'name',
  'version',
  'description',
  'author',
  'homepage',
  'repository',
  'license',
  'keywords',
  'extensions',
]);

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, filePath), 'utf8')) as Record<string, unknown>;
}

async function run() {
  for (const pluginPath of pluginPaths) {
    const plugin = readJson(pluginPath);
    assert(plugin.$schema === 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json', `${pluginPath} has the Agent Plugins 1.0 schema`);
    assert(plugin.name === 'hashtagweb3', `${pluginPath} has a valid plugin name`);
    assert(Object.keys(plugin).every((field) => allowedPluginFields.has(field)), `${pluginPath} contains only Agent Plugins fields`);
  }

  for (const mcpPath of ['mcp.json', 'public/mcp.json']) {
    const mcp = readJson(mcpPath);
    const servers = mcp.mcpServers as Record<string, { type?: string; url?: string }>;
    assert(mcp.$schema === 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json', `${mcpPath} has the Agent Plugins MCP schema`);
    assert(servers['hashtagweb3-product']?.url === 'https://hashtagweb3.com/api/mcp', `${mcpPath} declares the product MCP server`);
    assert(servers['hashtagweb3-docs']?.url === 'https://hashtagweb3.com/api/mcp-docs', `${mcpPath} declares the documentation MCP server`);
  }

  const homepage = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf8');
  assert(/openGraph:\s*{\s*type:\s*'website'/.test(homepage), 'Homepage metadata declares og:type=website');

  const developerPortal = fs.readFileSync(path.join(root, 'src/app/developers/page.tsx'), 'utf8');
  assert(developerPortal.includes("title: 'Hashtag Web3 API Docs & Developer Portal'"), 'Developer portal title includes the product name');
  assert(developerPortal.includes('https://github.com/vedangvatsa/Web3-Jobs'), 'Developer portal links the public agent configuration');

  const llms = fs.readFileSync(path.join(root, 'public/llms.txt'), 'utf8');
  assert(llms.includes('https://hashtagweb3.com/?mode=agent'), 'LLM context links the agent-mode view');
  assert(llms.includes('https://github.com/vedangvatsa/Web3-Jobs'), 'LLM context links the public repository');

  const agentsManifest = readJson('public/.well-known/agents.json');
  assert(String(agentsManifest.description).startsWith('Use Hashtag Web3 when'), 'Agent manifest describes when to use the product');

  const agentView = await getAgentView();
  const agentPayload = await agentView.json() as Record<string, unknown>;
  assert(agentView.status === 200, 'Agent-mode payload returns HTTP 200');
  assert(agentPayload.agent_mode === 'https://hashtagweb3.com/?mode=agent', 'Agent-mode payload self-identifies its entry point');

  const notFound = await getNotFoundMarkdown();
  const notFoundBody = await notFound.text();
  assert(notFound.status === 404, 'Agent recovery endpoint returns HTTP 404');
  assert(notFound.headers.get('Content-Type')?.startsWith('text/markdown'), 'Agent recovery endpoint returns Markdown');
  assert(notFoundBody.includes('https://hashtagweb3.com/llms.txt'), 'Agent recovery Markdown links the LLM context index');

  console.log('Agent readiness tests passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
