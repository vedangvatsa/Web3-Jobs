/**
 * Print Resend audiences and contact counts (use audience_id, not segment filters).
 * Usage: npx tsx scripts/resolve-resend-audience.ts
 */
import { Resend } from 'resend';
import { RESEND_GENERAL_AUDIENCE_ID } from './send-resend-broadcast';

async function countAudienceContacts(resend: Resend, audienceId: string): Promise<number> {
  let total = 0;
  let after: string | undefined;
  for (let page = 0; page < 100; page++) {
    const listed = await resend.contacts.list({ audienceId, limit: 100, after });
    if (listed.error) throw listed.error;
    total += listed.data?.data?.length ?? 0;
    if (!listed.data?.has_more) break;
    after = listed.data.data.at(-1)?.id;
    if (!after) break;
  }
  return total;
}

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY missing');
    process.exit(1);
  }
  const resend = new Resend(apiKey);
  const res = await fetch('https://api.resend.com/audiences', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    console.error('Failed to list audiences', await res.text());
    process.exit(1);
  }
  const json = (await res.json()) as { data?: Array<{ id: string; name: string }> };
  for (const aud of json.data ?? []) {
    const n = await countAudienceContacts(resend, aud.id);
    console.log(`${aud.name}\t${aud.id}\t${n} contacts`);
  }
  console.log(`\nDefault for broadcasts: General (${RESEND_GENERAL_AUDIENCE_ID})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
