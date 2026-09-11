import { GET as getJoobleFeed } from '../jobs/feed-aggregator.xml/route';

export const revalidate = 3600;

export async function GET() {
  return getJoobleFeed();
}
