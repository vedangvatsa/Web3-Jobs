import { GET as getJobsFeed } from "../jobs/feed.xml/route";

export const revalidate = 3600;

export async function GET() {
  return getJobsFeed();
}
