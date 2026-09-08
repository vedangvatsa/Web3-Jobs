import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEBCETHSpain() {
  console.log("Sending ETHSpain / European Blockchain Convention proposal to daniel@eblockchainconvention.com...");
  const ebcRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "daniel@eblockchainconvention.com",
    subject: "Official Community Partnership Proposal // ETHSpain & European Blockchain Convention x Hashtag Web3",
    text: `Hi Daniel & EBC / ETHSpain Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for ETHSpain and European Blockchain Convention. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com\nTelegram: https://t.me/web3jobs_rep`
  });
  console.log("EBC / ETHSpain result:", ebcRes);
}

sendEBCETHSpain();
