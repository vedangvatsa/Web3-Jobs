import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTaikaiAndForms() {
  // 1. ETHDam & ETHRome via Taikai Platform Team
  console.log("Sending proposal to Taikai platform team (hello@taikai.network)...");
  const taikaiRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "hello@taikai.network",
    subject: "Official Community Partnership Proposal // ETHDam & ETHRome x Hashtag Web3",
    text: `Hi Taikai Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for ETHDam and ETHRome hosted on Taikai. We will do a community blast across our channels to share an exclusive discount code/bounty access, thereby supporting our community members and driving registrations for your events.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your event partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  });
  console.log("Taikai result:", taikaiRes);

  // 2. ETHGlobal Global Partnership Form / Email
  console.log("Sending proposal to ETHGlobal (sponsor@ethglobal.com)...");
  const ethglobalRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "sponsor@ethglobal.com",
    subject: "Official Community Partnership Proposal // ETHGlobal (ETHSeoul) x Hashtag Web3",
    text: `Hi ETHGlobal Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership across ETHGlobal events including ETHSeoul. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your events.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  });
  console.log("ETHGlobal result:", ethglobalRes);
}

sendTaikaiAndForms();
