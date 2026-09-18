import { buildJoobleFeedResponse } from '@/lib/job-aggregator-feed';

export const revalidate = 3600;

export async function GET() {
  return buildJoobleFeedResponse();
}
