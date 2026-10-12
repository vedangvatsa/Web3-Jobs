import { buildJoobleFeedResponse } from '@/lib/job-aggregator-feed';

export const dynamic = 'force-dynamic';

export async function GET() {
  return buildJoobleFeedResponse();
}
