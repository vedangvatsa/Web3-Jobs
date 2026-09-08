import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailTemplates: Record<string, { subject: string; text: string }> = {
  ETHKL: {
    subject: "Official Community Partnership Proposal // ETHKL x Hashtag Web3",
    text: `Hi ETHKL Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for ETHKL. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nA quick snapshot of our reach:\n- Platform Scale: 55M+ annual job board views connecting top developers, founders, and Web3 professionals.\n- X (Twitter) Spaces: Weekly sessions attended by 20k-40k live listeners.\n- Social & Content: 26M views last year on LinkedIn | 16,000 newsletter subscribers.\n- Direct Messaging: 75,000+ on Telegram (channel & group) and 22,000+ in WhatsApp communities.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com\nTelegram: https://t.me/web3jobs_rep`
  },
  JBW: {
    subject: "Official Community Partnership Proposal // Japan Blockchain Week x Hashtag Web3",
    text: `Hi Japan Blockchain Week Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for Japan Blockchain Week. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  },
  ETHWarsaw: {
    subject: "Official Community Partnership Proposal // ETHWarsaw x Hashtag Web3",
    text: `Hi ETHWarsaw Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for ETHWarsaw. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  },
  Boston: {
    subject: "Official Community Partnership Proposal // Boston Blockchain Week x Hashtag Web3",
    text: `Hi Boston Blockchain Week Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for Boston Blockchain Week. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  },
  Cypherpunk: {
    subject: "Community Partnership with Ethereum Cypherpunk Congress",
    text: `Hi Cypherpunk Congress Team,\n\nHope you are having a wonderful week!\n\nI am reaching out from Hashtag Web3 to explore an official community partnership for Ethereum Cypherpunk Congress. We will do a community blast across our channels to share an exclusive discount code, thereby supporting our community members and driving registrations for your event.\n\nHashtag Web3 is one of the largest Web3 job boards in the world, with 55 million annual views and a 100k+ member builder network.\n\nCommunity Overview: https://hashtagweb3.com/community\n\nIn return, we would love:\n1. Our logo on your website's partner section with a backlink (high-res transparent logo: https://hashtagweb3.com/logo/HashtagWeb3.png).\n2. An exclusive community discount code along with complimentary ticket(s) for our team to attend or run a member giveaway.\n\nPlease let me know if this sounds good to you!\n\nWarm regards,\n\nAlex\nPartnerships Lead | Hashtag Web3\nWebsite: https://hashtagweb3.com`
  }
};

async function resendBounced() {
  // 1. Resend ETHKL to verified community@ethkl.org
  console.log("Sending ETHKL to community@ethkl.org...");
  const ethklRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "community@ethkl.org",
    subject: emailTemplates.ETHKL.subject,
    text: emailTemplates.ETHKL.text
  });
  console.log("ETHKL result:", ethklRes);

  // 2. Resend Japan Blockchain Week to verified staff@japanblockchainweek.jp
  console.log("Sending Japan Blockchain Week to staff@japanblockchainweek.jp...");
  const jbwRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "staff@japanblockchainweek.jp",
    subject: emailTemplates.JBW.subject,
    text: emailTemplates.JBW.text
  });
  console.log("JBW result:", jbwRes);

  // 3. Resend ETHWarsaw to verified lukasz@ethwarsaw.dev
  console.log("Sending ETHWarsaw to lukasz@ethwarsaw.dev...");
  const ethwRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "lukasz@ethwarsaw.dev",
    subject: emailTemplates.ETHWarsaw.subject,
    text: emailTemplates.ETHWarsaw.text
  });
  console.log("ETHWarsaw result:", ethwRes);

  // 4. Resend Boston Blockchain Week to john@qubiclabs.com without invalid privacy email
  console.log("Sending Boston Blockchain Week to john@qubiclabs.com...");
  const bostonRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "john@qubiclabs.com",
    subject: emailTemplates.Boston.subject,
    text: emailTemplates.Boston.text
  });
  console.log("Boston result:", bostonRes);

  // 5. Resend Ethereum Cypherpunk Congress to web3privacynow@protonmail.com without invalid congress email
  console.log("Sending Ethereum Cypherpunk Congress to web3privacynow@protonmail.com...");
  const cypherRes = await resend.emails.send({
    from: "Alex from Hashtag Web3 <contact@hashtagweb3.com>",
    to: "web3privacynow@protonmail.com",
    subject: emailTemplates.Cypherpunk.subject,
    text: emailTemplates.Cypherpunk.text
  });
  console.log("Cypherpunk result:", cypherRes);
}

resendBounced();
