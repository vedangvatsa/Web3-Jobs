import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailTemplates: Record<string, { subject: string; text: string }> = {
  ETHDenver: {
    subject: "Official Community Partnership Proposal // ETHDenver x Hashtag Web3",
    text: `Hi ETHDenver Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for ETHDenver. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  },
  ETHTaipei: {
    subject: "Official Community Partnership Proposal // ETHTaipei x Hashtag Web3",
    text: `Hi ETHTaipei Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for ETHTaipei. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  },
  ETHCC: {
    subject: "Official Community Partnership Proposal // EthCC x Hashtag Web3",
    text: `Hi EthCC Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for EthCC. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  }
};

async function sendBatch3() {
  // 1. ETHDenver -> hello@ethdenver.com
  console.log("Sending ETHDenver to hello@ethdenver.com...");
  const ethdenverRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "hello@ethdenver.com",
    subject: emailTemplates.ETHDenver.subject,
    text: emailTemplates.ETHDenver.text
  });
  console.log("ETHDenver result:", ethdenverRes);

  // 2. ETHTaipei -> ethtaipei23@gmail.com
  console.log("Sending ETHTaipei to ethtaipei23@gmail.com...");
  const ethtaipeiRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "ethtaipei23@gmail.com",
    subject: emailTemplates.ETHTaipei.subject,
    text: emailTemplates.ETHTaipei.text
  });
  console.log("ETHTaipei result:", ethtaipeiRes);

  // 3. EthCC -> tickets@ethereum-france.com
  console.log("Sending EthCC to tickets@ethereum-france.com...");
  const ethccRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "tickets@ethereum-france.com",
    subject: emailTemplates.ETHCC.subject,
    text: emailTemplates.ETHCC.text
  });
  console.log("EthCC result:", ethccRes);
}

sendBatch3();
