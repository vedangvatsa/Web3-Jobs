import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import dotenv from 'dotenv';
import { getLinkedInMember, PERSONAL_LINKEDIN_NAME, PERSONAL_LINKEDIN_PROFILE } from './linkedin-personal';

const DIRECTORY = path.resolve('credentials/linkedin-personal');
const STATE_FILE = path.join(DIRECTORY, 'oauth-state.json');
const TOKEN_FILE = path.join(DIRECTORY, 'authorization.json');
export const SCOPES = ['openid', 'profile', 'w_member_social'];
type OAuthState = { state: string; createdAt: number; clientId: string; redirectUri: string };

export function authorizationUrl(saved: OAuthState): string {
  const url = new URL('https://www.linkedin.com/oauth/v2/authorization');
  url.search = new URLSearchParams({ response_type: 'code', client_id: saved.clientId, redirect_uri: saved.redirectUri, state: saved.state, scope: SCOPES.join(' ') }).toString();
  return url.toString();
}

export function callbackCode(callback: string, saved: OAuthState, now = Date.now()): string {
  if (now - saved.createdAt > 30 * 60 * 1000 || now < saved.createdAt) throw new Error('Authorization request expired; run start again');
  const url = new URL(callback.trim());
  const expected = new URL(saved.redirectUri);
  if (url.origin !== expected.origin || url.pathname !== expected.pathname || url.hash) throw new Error('Unexpected OAuth callback URL');
  const state = Buffer.from(url.searchParams.get('state') || '');
  const original = Buffer.from(saved.state);
  if (state.length !== original.length || !crypto.timingSafeEqual(state, original)) throw new Error('OAuth state mismatch');
  if (url.searchParams.has('error')) throw new Error('LinkedIn authorization was declined or the app lacks the requested products');
  const code = url.searchParams.get('code');
  if (!code) throw new Error('OAuth callback did not include a code');
  return code;
}

function savePrivate(file: string, data: unknown): void {
  fs.mkdirSync(DIRECTORY, { recursive: true, mode: 0o700 });
  fs.chmodSync(DIRECTORY, 0o700);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 });
  fs.chmodSync(file, 0o600);
}

async function main() {
  dotenv.config({ path: '.env.linkedin-personal.local', quiet: true });
  const action = process.argv[2];
  if (action === 'start') {
    const clientId = process.env.LINKEDIN_PERSONAL_CLIENT_ID;
    if (!clientId || !process.env.LINKEDIN_PERSONAL_CLIENT_SECRET) throw new Error('Set LINKEDIN_PERSONAL_CLIENT_ID and LINKEDIN_PERSONAL_CLIENT_SECRET in .env.linkedin-personal.local first');
    const redirectUri = process.env.LINKEDIN_PERSONAL_REDIRECT_URI || 'https://hashtagweb3.com/contact';
    if (new URL(redirectUri).protocol !== 'https:') throw new Error('Use a registered HTTPS redirect URI');
    const saved = { clientId, redirectUri, state: crypto.randomBytes(32).toString('hex'), createdAt: Date.now() };
    savePrivate(STATE_FILE, saved);
    console.log(`Ask ${PERSONAL_LINKEDIN_NAME} (${PERSONAL_LINKEDIN_PROFILE}) to authorize this URL while signed into that profile:`);
    console.log(authorizationUrl(saved));
    console.log('After redirect, supply the full callback URL privately to the local finish command. Do not paste it into chat.');
    return;
  }
  if (action === 'finish') {
    const saved = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as OAuthState;
    const secret = process.env.LINKEDIN_PERSONAL_CLIENT_SECRET;
    if (!secret || saved.clientId !== process.env.LINKEDIN_PERSONAL_CLIENT_ID) throw new Error('OAuth app configuration changed; run start again');
    const terminal = createInterface({ input: process.stdin, output: process.stdout });
    let callback: string;
    try { callback = await terminal.question('Paste the callback URL here (local terminal only): '); } finally { terminal.close(); }
    const code = callbackCode(callback, saved);
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: AbortSignal.timeout(30000),
      body: new URLSearchParams({ grant_type: 'authorization_code', code, client_id: saved.clientId, client_secret: secret, redirect_uri: saved.redirectUri }),
    });
    if (!response.ok) {
      const failure = await response.json().catch(() => ({})) as { error?: string; error_description?: string };
      const detail = `${failure.error || 'unknown_error'}: ${failure.error_description || ''}`
        .replaceAll(secret, '[redacted]').replaceAll(code, '[redacted]');
      throw new Error(`LinkedIn token exchange failed: HTTP ${response.status} ${detail}`);
    }
    const token = await response.json() as { access_token?: string; expires_in?: number; scope?: string };
    if (!token.access_token || !Number.isFinite(token.expires_in) || token.expires_in! <= 0) throw new Error('LinkedIn returned an invalid token response');
    if (token.scope && !token.scope.split(/[ ,]+/).includes('w_member_social')) throw new Error('LinkedIn did not grant w_member_social');
    const member = await getLinkedInMember(token.access_token);
    if (member.name.trim().toLowerCase() !== PERSONAL_LINKEDIN_NAME.toLowerCase()) throw new Error(`Authorized account is ${member.name}, not ${PERSONAL_LINKEDIN_NAME}. No posting credentials saved.`);
    savePrivate(TOKEN_FILE, { token: token.access_token, memberId: member.sub, name: member.name, profileUrl: PERSONAL_LINKEDIN_PROFILE, expiresAt: new Date(Date.now() + token.expires_in! * 1000).toISOString() });
    fs.unlinkSync(STATE_FILE);
    console.log(`Authorization saved for ${member.name}. Member ID: ${member.sub}. No post created. Run install-github to configure scheduled posting.`);
    return;
  }
  if (action === 'install-github') {
    const saved = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf8'));
    if (Date.parse(saved.expiresAt) <= Date.now() + 60000) throw new Error('Authorization expired; authorize again');
    const member = await getLinkedInMember(saved.token);
    if (member.sub !== saved.memberId || member.name.trim().toLowerCase() !== PERSONAL_LINKEDIN_NAME.toLowerCase()) throw new Error('Saved LinkedIn member does not match Easton');
    const repo = 'vedangvatsa/Web3-Jobs';
    for (const [name, value] of Object.entries({ LINKEDIN_PERSONAL_ACCESS_TOKEN: saved.token, LINKEDIN_PERSONAL_MEMBER_ID: saved.memberId, LINKEDIN_PERSONAL_TOKEN_EXPIRES_AT: saved.expiresAt })) {
      execFileSync('gh', ['secret', 'set', name, '--repo', repo], { input: String(value), stdio: ['pipe', 'pipe', 'pipe'] });
    }
    execFileSync('gh', ['variable', 'set', 'LINKEDIN_PERSONAL_ENABLED', '--body', 'true', '--repo', repo], { stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(`Configured ${member.name} for the next scheduled run. Token expires ${saved.expiresAt}. No post created.`);
    return;
  }
  throw new Error('Usage: npx tsx scripts/social/authorize-linkedin-personal.ts start|finish|install-github');
}

if (require.main === module) main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'LinkedIn authorization failed');
  process.exitCode = 1;
});
