import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBatch2() {
  // 1. India Blockchain Week -> ibw2026-pr@brandarcadvisors.com
  console.log("Sending India Blockchain Week to ibw2026-pr@brandarcadvisors.com...");
  const ibwRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "ibw2026-pr@brandarcadvisors.com",
    subject: "Official Community Partnership Proposal // India Blockchain Week x Hashtag Web3",
    text: `Hi India Blockchain Week Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for India Blockchain Week. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  });
  console.log("IBW Result:", ibwRes);
}

sendBatch2();
