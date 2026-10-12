import { GET as getMyJobHelperFeed } from '../jobs/feed-aggregator-us.xml/route';

export const dynamic = 'force-dynamic';

export async function GET() {
  return getMyJobHelperFeed();
}
