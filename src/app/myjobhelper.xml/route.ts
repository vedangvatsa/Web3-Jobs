import { GET as getMyJobHelperFeed } from '../jobs/feed-aggregator-us.xml/route';

export const revalidate = 3600;

export async function GET() {
  return getMyJobHelperFeed();
}
