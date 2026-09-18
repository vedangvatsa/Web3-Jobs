import fs from 'fs';
import path from 'path';

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
    assert(mcp.$schema === 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json', `${mcpPath} has the Agent Plugins MCP schema`);
    assert(mcp.mcpServers && typeof mcp.mcpServers === 'object', `${mcpPath} declares mcpServers`);
  }

  const homepage = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf8');
  assert(/openGraph:\s*{\s*type:\s*'website'/.test(homepage), 'Homepage metadata declares og:type=website');

  const developerPortal = fs.readFileSync(path.join(root, 'src/app/developers/page.tsx'), 'utf8');
  assert(developerPortal.includes("title: 'Hashtag Web3 API Docs & Developer Portal'"), 'Developer portal title includes the product name');
  assert(developerPortal.includes('https://github.com/vedangvatsa/Web3-Jobs'), 'Developer portal links the public agent configuration');

  const llms = fs.readFileSync(path.join(root, 'public/llms.txt'), 'utf8');
  assert(llms.includes('https://hashtagweb3.com/?mode=agent'), 'LLM context links the agent-mode view');
  assert(llms.includes('https://github.com/vedangvatsa/Web3-Jobs'), 'LLM context links the public repository');
  assert(llms.includes('/data/jobs-runtime.json'), 'LLM context links the static jobs catalog');

  const agentsManifest = readJson('public/.well-known/agents.json');
  assert(String(agentsManifest.description).startsWith('Use Hashtag Web3 when'), 'Agent manifest describes when to use the product');

  const agentView = readJson('public/agent-view.json');
  assert(agentView.agent_mode === 'https://hashtagweb3.com/?mode=agent', 'Agent-mode payload self-identifies its entry point');
  assert(Array.isArray(agentView.static_catalogs), 'Agent-mode payload lists static catalogs');

  const notFoundMd = fs.readFileSync(path.join(root, 'public/404.md'), 'utf8');
  assert(notFoundMd.includes('https://hashtagweb3.com/llms.txt'), 'Static 404 Markdown links the LLM context index');

  console.log('Agent readiness tests passed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
