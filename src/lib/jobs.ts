
'use server';

import Parser from 'rss-parser';
import type { Job } from '@/types';

// The jobs you manually added are now stored here permanently.
const MANUAL_JOBS: Job[] = [
    {
      "id": "1",
      "title": "Senior Smart Contract Engineer",
      "company": "Nexus Protocol",
      "link": "https://jobs.hashtagweb3.com/jobs/nexus-protocol-senior-smart-contract-engineer",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "2",
      "title": "Lead Frontend Developer (DeFi)",
      "company": "Statera",
      "link": "https://jobs.hashtagweb3.com/jobs/statera-lead-frontend-developer-defi",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "3",
      "title": "Community Manager (APAC)",
      "company": "Aura Network",
      "link": "https://jobs.hashtagweb3.com/jobs/aura-network-community-manager-apac",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "4",
      "title": "Head of Engineering",
      "company": "EigenLayer",
      "link": "https://jobs.hashtagweb3.com/jobs/eigenlayer-head-of-engineering",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "5",
      "title": "Quantitative Researcher",
      "company": "Wintermute",
      "link": "https://jobs.hashtagweb3.com/jobs/wintermute-quantitative-researcher",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "6",
      "title": "Senior Rust Engineer (L1)",
      "company": "Celestia",
      "link": "https://jobs.hashtagweb3.com/jobs/celestia-senior-rust-engineer-l1",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "7",
      "title": "Product Marketing Manager",
      "company": "Chainlink Labs",
      "link": "https://jobs.hashtagweb3.com/jobs/chainlink-labs-product-marketing-manager",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "8",
      "title": "DevOps Engineer",
      "company": "Scroll",
      "link": "https://jobs.hashtagweb3.com/jobs/scroll-devops-engineer",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "9",
      "title": "Senior Data Analyst (On-Chain)",
      "company": "Dune Analytics",
      "link": "https://jobs.hashtagweb3.com/jobs/dune-analytics-senior-data-analyst-on-chain",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "10",
      "title": "Lead UX/UI Designer",
      "company": "Phantom Wallet",
      "link": "https://jobs.hashtagweb3.com/jobs/phantom-wallet-lead-uxui-designer",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "11",
      "title": "Technical Writer",
      "company": "Ethereum Foundation",
      "link": "https://jobs.hashtagweb3.com/jobs/ethereum-foundation-technical-writer",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
      "id": "12",
      "title": "Head of Talent",
      "company": "a16z Crypto",
      "link": "https://jobs.hashtagweb3.com/jobs/a16z-crypto-head-of-talent",
      "date": "2024-08-15T12:00:00Z",
      "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/alchemy/jobs/4599359005",
        "title": "Site Reliability Engineer",
        "company": "Alchemy",
        "link": "https://job-boards.greenhouse.io/alchemy/jobs/4599359005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5628728004",
        "title": "Partner Marketer",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5628728004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/2b9a141e-0669-4197-aa52-2b07d9fadc96?lever-source%5B%5D=jobs.a16z.com",
        "title": "Software Engineer - Platform",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/2b9a141e-0669-4197-aa52-2b07d9fadc96?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7182039",
        "title": "Senior Mobile Engineer (Android)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7182039",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/eigen-labs/4e018bca-ec96-43f7-a3f6-b784bbd19a7f?utm_source=jobs.a16z.com",
        "title": "Staff Software Engineer, Fullstack",
        "company": "EigenLayer",
        "link": "https://jobs.ashbyhq.com/eigen-labs/4e018bca-ec96-43f7-a3f6-b784bbd19a7f?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6688696003",
        "title": "Senior Analytics Engineer II",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6688696003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/mystenlabs/7faf0127-1e2d-4a2e-808c-24868daa9a3a?utm_source=jobs.a16z.com",
        "title": "Senior Communications Manager, Walrus",
        "company": "Mysten Labs",
        "link": "https://jobs.ashbyhq.com/mystenlabs/7faf0127-1e2d-4a2e-808c-24868daa9a3a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/9006a802-8d9c-43a3-b566-dca55ce73819?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Revenue Accountant",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/9006a802-8d9c-43a3-b566-dca55ce73819?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/spade/jobs/4598919005",
        "title": "Head of Engineering",
        "company": "Spade",
        "link": "https://job-boards.greenhouse.io/spade/jobs/4598919005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7185423",
        "title": "Advertising Operations Associate",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7185423",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7e02daad-59d2-49f3-afa3-b9b568e4edc5?utm_source=jobs.a16z.com",
        "title": "Payroll Associate, Africa Payroll | India",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7e02daad-59d2-49f3-afa3-b9b568e4edc5?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/285cbc02-bf6c-4f9e-903c-85fb5a9e9c10?utm_source=jobs.a16z.com",
        "title": "Senior Manager of Accounting Operations",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/285cbc02-bf6c-4f9e-903c-85fb5a9e9c10?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/method/de13a369-ccb9-4b03-9a28-a8e551ee3949?utm_source=jobs.a16z.com",
        "title": "Senior Software Engineer",
        "company": "Method",
        "link": "https://jobs.ashbyhq.com/method/de13a369-ccb9-4b03-9a28-a8e551ee3949?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/lightspark/e207e505-6b0c-4f1f-ae97-6e75dbd9fbeb?utm_source=jobs.a16z.com",
        "title": "Senior Staff Engineer, Spark",
        "company": "Lightspark",
        "link": "https://jobs.ashbyhq.com/lightspark/e207e505-6b0c-4f1f-ae97-6e75dbd9fbeb?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/bd688703-36be-4d64-aea7-c2c83c8fe3f3?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Compliance, Singapore",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/bd688703-36be-4d64-aea7-c2c83c8fe3f3?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4589818006",
        "title": "Director, Product Management (Consumer)",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4589818006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Solana%20Foundation/32de1a78-2e7d-469d-b846-c61152324365?utm_source=jobs.a16z.com",
        "title": "Growth Lead- Japan",
        "company": "Solana Foundation",
        "link": "https://jobs.ashbyhq.com/Solana%20Foundation/32de1a78-2e7d-469d-b846-c61152324365?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Sui%20Foundation/833f7999-f042-43d3-b2b4-e8064bee8cd7?utm_source=jobs.a16z.com",
        "title": "Partner Marketing Coordinator - Walrus (Contract)",
        "company": "Sui Foundation",
        "link": "https://jobs.ashbyhq.com/Sui%20Foundation/833f7999-f042-43d3-b2b4-e8064bee8cd7?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/e62916c2-71d8-4c04-a3a5-1331700e4e46?utm_source=jobs.a16z.com",
        "title": "Enterprise Sales Lead, Payments",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/e62916c2-71d8-4c04-a3a5-1331700e4e46?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/walrus/21e0f179-40c8-4d6a-b241-97cbcdb5e3d6?utm_source=jobs.a16z.com",
        "title": "Chief of Staff",
        "company": "Walrus Foundation",
        "link": "https://jobs.ashbyhq.com/walrus/21e0f179-40c8-4d6a-b241-97cbcdb5e3d6?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/0e9c8c3f-ae73-43e7-b882-1a42af518973?utm_source=jobs.a16z.com",
        "title": "Strategic Account Executive, Financial Services",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/0e9c8c3f-ae73-43e7-b882-1a42af518973?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/4386e2ac-bcb7-496c-9108-502ce29dabd8?utm_source=jobs.a16z.com",
        "title": "Events & Community Lead",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/4386e2ac-bcb7-496c-9108-502ce29dabd8?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/eaa0267b-d44c-4168-8977-8a0ec585b599?lever-source%5B%5D=jobs.a16z.com",
        "title": "Key Account Manager (Qatar)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/eaa0267b-d44c-4168-8977-8a0ec585b599?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6688184003",
        "title": "Workday LMS Consultant",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6688184003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Runway/c17a5f0b-ce37-4544-9107-cea79ac39d44?utm_source=jobs.a16z.com",
        "title": "FP&A Experience Manager",
        "company": "Runway",
        "link": "https://jobs.ashbyhq.com/Runway/c17a5f0b-ce37-4544-9107-cea79ac39d44?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/d767361b-4d3b-47ee-b16b-31011195b93c?utm_source=jobs.a16z.com",
        "title": "Lead Product Designer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/d767361b-4d3b-47ee-b16b-31011195b93c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://branchinternational.applytojob.com/apply/E5RGe7p13E/Software-Engineer-DevOps-Security",
        "title": "Software Engineer - DevOps Security",
        "company": "Branch International",
        "link": "https://branchinternational.applytojob.com/apply/E5RGe7p13E/Software-Engineer-DevOps-Security",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/withclutch/0c3c4ec5-8dea-4d36-a560-9024e3961389?utm_source=jobs.a16z.com",
        "title": "Engagement Manager",
        "company": "Clutch",
        "link": "https://jobs.ashbyhq.com/withclutch/0c3c4ec5-8dea-4d36-a560-9024e3961389?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/phantom/b7d0a7f7-c1d0-43c3-936f-c97ff46ee72e?utm_source=jobs.a16z.com",
        "title": "Backend Engineer, Blockchain Data Team",
        "company": "Phantom",
        "link": "https://jobs.ashbyhq.com/phantom/b7d0a7f7-c1d0-43c3-936f-c97ff46ee72e?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5628475004",
        "title": "Sales Development - Lead",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5628475004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/9d15c09f-d352-4c9d-aeb5-408b883cc2e8?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Engineer - Enterprise",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/9d15c09f-d352-4c9d-aeb5-408b883cc2e8?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5625060004",
        "title": "Senior Program Manager - Financial Crimes",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5625060004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7178297",
        "title": "Senior Software Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7178297",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7178471",
        "title": "Staff Machine Learning Platform Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7178471",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/eed2fec0-67fe-4a1d-a237-3b9b5bf9f114?lever-source%5B%5D=jobs.a16z.com",
        "title": "Product Marketing Manager - Industry",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/eed2fec0-67fe-4a1d-a237-3b9b5bf9f114?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5624250004",
        "title": "Senior Account Executive - eCommerce",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5624250004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7176669",
        "title": "Staff Software Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7176669",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6685766003",
        "title": "Senior Analytics Engineer I",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6685766003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c9f77c25-f4c9-45d2-9c9b-4dc258279f23?utm_source=jobs.a16z.com",
        "title": "Senior Finance Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c9f77c25-f4c9-45d2-9c9b-4dc258279f23?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5620024004",
        "title": "Customer Support Specialist - Weekend Coverage",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5620024004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/2adcbb66-7180-40d5-a3de-a4ef2ce8ab70?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Associate, Australia Payroll | India",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/2adcbb66-7180-40d5-a3de-a4ef2ce8ab70?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/alchemy/jobs/4600392005",
        "title": "Enterprise Account Executive",
        "company": "Alchemy",
        "link": "https://job-boards.greenhouse.io/alchemy/jobs/4600392005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7176250",
        "title": "Senior Growth Marketing Manager, Offline",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7176250",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7158739",
        "title": "Sales Program Manager, AMER",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7158739",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7182037",
        "title": "Senior Software Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7182037",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7174279",
        "title": "Software Engineer, Distributed Caching Platform",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7174279",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7168716",
        "title": "Backend/API Engineer, Money as a Service",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7168716",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7181979",
        "title": "Billing Solutions Architect",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7181979",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/70cf1163-b70c-492e-9228-b44d264a7c30?utm_source=jobs.a16z.com",
        "title": "Manager, Sales Development | North Asia",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/70cf1163-b70c-492e-9228-b44d264a7c30?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/776333d3-864d-42db-9ea4-49381143160a?utm_source=jobs.a16z.com",
        "title": "Warehouse AssociateIT equipment | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/776333d3-864d-42db-9ea4-49381143160a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Sui%20Foundation/c4c3a084-3073-4127-ac26-2885162ad5e9?utm_source=jobs.a16z.com",
        "title": "Partner Marketing Manager - Walrus",
        "company": "Sui Foundation",
        "link": "https://jobs.ashbyhq.com/Sui%20Foundation/c4c3a084-3073-4127-ac26-2885162ad5e9?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/03ca0083-d2d6-4992-b970-8f42433a097e?utm_source=jobs.a16z.com",
        "title": "Shipping Assistant, IT Equipment | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/03ca0083-d2d6-4992-b970-8f42433a097e?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7c8cd628-e335-468d-b302-8b5ca0d6b646?utm_source=jobs.a16z.com",
        "title": "Account Executive, Global Payroll, SMB",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7c8cd628-e335-468d-b302-8b5ca0d6b646?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/416414c5-7c63-4e42-8885-3c29d8be120d?utm_source=jobs.a16z.com",
        "title": "Associate Director, Sales Operations | Americas",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/416414c5-7c63-4e42-8885-3c29d8be120d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Solana%20Foundation/a3bf1757-a7dc-49be-b77e-04b790477ecb?utm_source=jobs.a16z.com",
        "title": "Growth Lead- Greater China",
        "company": "Solana Foundation",
        "link": "https://jobs.ashbyhq.com/Solana%20Foundation/a3bf1757-a7dc-49be-b77e-04b790477ecb?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/da1ecf01-7421-42d6-8c2d-28dd73bc8976?utm_source=jobs.a16z.com",
        "title": "Senior Partner Marketing Manager | Campaigns",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/da1ecf01-7421-42d6-8c2d-28dd73bc8976?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Sui%20Foundation/10589133-2489-4f66-9e3a-d4a24f166bfc?utm_source=jobs.a16z.com",
        "title": "Social Media Marketing Manager - Walrus",
        "company": "Sui Foundation",
        "link": "https://jobs.ashbyhq.com/Sui%20Foundation/10589133-2489-4f66-9e3a-d4a24f166bfc?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/67f84e2f-f07d-4125-a741-bcd3eaedefa2?utm_source=jobs.a16z.com",
        "title": "Global Supply Chain Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/67f84e2f-f07d-4125-a741-bcd3eaedefa2?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/701be0a4-7b79-4f0f-a9f6-fe10bca48949?utm_source=jobs.a16z.com",
        "title": "Senior Partner Marketing Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/701be0a4-7b79-4f0f-a9f6-fe10bca48949?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/ac39d5bf-b7b2-4186-a84c-02eff562e5dd?utm_source=jobs.a16z.com",
        "title": "Enterprise Sales Lead, Institutions",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/ac39d5bf-b7b2-4186-a84c-02eff562e5dd?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/6c855bd4-2cd3-4946-8a25-57a163a022fb?utm_source=jobs.a16z.com",
        "title": "Staff Product Manager - Treasury",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/6c855bd4-2cd3-4946-8a25-57a163a022fb?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/a12df33b-5685-41ac-a6a6-59723d9fcce5?utm_source=jobs.a16z.com",
        "title": "Fulfilment Centre Associate, IT equipment | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/a12df33b-5685-41ac-a6a6-59723d9fcce5?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/c84d85db-4638-43c9-a814-afbf3c397412?utm_source=jobs.a16z.com",
        "title": "Staff Engineer (AI/ML Systems)",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/c84d85db-4638-43c9-a814-afbf3c397412?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/0cc843ae-4233-4448-b097-0126070b58cb?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Expert | USA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/0cc843ae-4233-4448-b097-0126070b58cb?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/62192257-41ad-43b6-855d-9187113e05bb?utm_source=jobs.a16z.com",
        "title": "Order Operations Associate, IT equipment shipping | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/62192257-41ad-43b6-855d-9187113e05bb?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/f12e4f49-23d1-48b6-836d-3d7da7e38291?utm_source=jobs.a16z.com",
        "title": "Product Manager, Payments",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/f12e4f49-23d1-48b6-836d-3d7da7e38291?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/8c67d644-c38c-4e4d-98d1-524e79452697?utm_source=jobs.a16z.com",
        "title": "Enterprise Sales Lead, CeX",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/8c67d644-c38c-4e4d-98d1-524e79452697?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/lightspark/a97c84ff-80f0-4006-8bc8-a4a21139c382?utm_source=jobs.a16z.com",
        "title": "Staff Backend Engineer, Spark",
        "company": "Lightspark",
        "link": "https://jobs.ashbyhq.com/lightspark/a97c84ff-80f0-4006-8bc8-a4a21139c382?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7182535",
        "title": "Partner Development Manager (French Speaking)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7182535",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/fad0bc38-3f55-4bfb-ab95-4815acc5f376?lever-source%5B%5D=jobs.a16z.com",
        "title": "Revenue Accounting Manager",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/fad0bc38-3f55-4bfb-ab95-4815acc5f376?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7155893",
        "title": "Account Executive, Product Sales, Link",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7155893",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7154004",
        "title": "Integration Reliability Engineer, Technical Operations, Local Payment Methods",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7154004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7174967",
        "title": "Manager Enablement Lead, EMEA",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7174967",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/lightspark/c143bf7f-dd98-4a2f-8fb5-9d7e437353f4?utm_source=jobs.a16z.com",
        "title": "Senior Production Engineer",
        "company": "Lightspark",
        "link": "https://jobs.ashbyhq.com/lightspark/c143bf7f-dd98-4a2f-8fb5-9d7e437353f4?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/0cf7d0ee-0c5a-4641-8f21-2ac6e48b480f?lever-source%5B%5D=jobs.a16z.com",
        "title": "Technical Lead Manager - Credit Dashboard",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/0cf7d0ee-0c5a-4641-8f21-2ac6e48b480f?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6688699003",
        "title": "Senior Analytics Engineer II",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6688699003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7169392",
        "title": "Risk Ops Tech Enablement Programs, Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7169392",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/38b12877-0c3f-4b7a-adec-85cf3419dbfc?utm_source=jobs.a16z.com",
        "title": "Senior Technical Writer, Integrations",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/38b12877-0c3f-4b7a-adec-85cf3419dbfc?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/4ccfab89-f11b-4e80-b109-6ab8cd495a53?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Associate | India",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/4ccfab89-f11b-4e80-b109-6ab8cd495a53?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1cde6b24-a110-4b1e-b7a1-0e3cdf489d21?utm_source=jobs.a16z.com",
        "title": "Senior Manager, Payroll (EMEA/APAC)",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1cde6b24-a110-4b1e-b7a1-0e3cdf489d21?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/fd7f12d2-8e57-4c97-8f85-603d57d8243c?utm_source=jobs.a16z.com",
        "title": "Immigration Consultant",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/fd7f12d2-8e57-4c97-8f85-603d57d8243c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/605d7020-9b04-41e7-b974-ffe3b6989053?utm_source=jobs.a16z.com",
        "title": "Senior Software Engineer, ML Platform & Ops",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/605d7020-9b04-41e7-b974-ffe3b6989053?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/5c88bf0b-b4c5-4f11-bd64-47eb13aec204?utm_source=jobs.a16z.com",
        "title": "Senior Product Operations Manager, FinCrime",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/5c88bf0b-b4c5-4f11-bd64-47eb13aec204?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/52d69e00-0bd7-4e0f-a6bd-fae8044e5415?utm_source=jobs.a16z.com",
        "title": "Immigration Consultant",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/52d69e00-0bd7-4e0f-a6bd-fae8044e5415?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/a1491b80-f0c2-4968-80f2-419edc9f869d?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager, Melis",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/a1491b80-f0c2-4968-80f2-419edc9f869d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9aa56d22-b3e5-491b-9b93-7815f9b82350?utm_source=jobs.a16z.com",
        "title": "Senior Product Partnerships Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9aa56d22-b3e5-491b-9b93-7815f9b82350?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bfdce105-98d0-4c62-b41b-8e05e5d48d27?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Netherlands",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bfdce105-98d0-4c62-b41b-8e05e5d48d27?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/de7fb381-026b-420a-8366-f04dffd64f61?utm_source=jobs.a16z.com",
        "title": "AI Product Engineer",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/de7fb381-026b-420a-8366-f04dffd64f61?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/552372cb-97b0-4e7b-92c5-16f52186466e?utm_source=jobs.a16z.com",
        "title": "Payroll Associate | Germany",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/552372cb-97b0-4e7b-92c5-16f52186466e?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9d9083fc-3bcd-47c3-a122-a6dbc85d23f6?utm_source=jobs.a16z.com",
        "title": "Data Privacy Compliance Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9d9083fc-3bcd-47c3-a122-a6dbc85d23f6?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/442c861b-63bf-47cd-8815-20cb9fc0ddbb?utm_source=jobs.a16z.com",
        "title": "SecOps Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/442c861b-63bf-47cd-8815-20cb9fc0ddbb?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/e2e34c82-5920-4291-aeb2-b6aa91c039fa?utm_source=jobs.a16z.com",
        "title": "Senior Manager, Payroll, EMEA/APAC",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/e2e34c82-5920-4291-aeb2-b6aa91c039fa?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/76f3a906-81f2-4d4c-99ce-e1a97c1ac5a6?utm_source=jobs.a16z.com",
        "title": "Back End Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/76f3a906-81f2-4d4c-99ce-e1a97c1ac5a6?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/01642d10-5573-4eac-bb36-4f2bbe91874b?utm_source=jobs.a16z.com",
        "title": "Senior Product Manager - EOR",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/01642d10-5573-4eac-bb36-4f2bbe91874b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/838569fc-b2c7-4b03-936a-76ac608b696e?utm_source=jobs.a16z.com",
        "title": "Immigration Consultant",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/838569fc-b2c7-4b03-936a-76ac608b696e?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4592549006",
        "title": "Information Security Analyst",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4592549006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/8e87f48f-9643-4a87-87bf-c6fcd3336586?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Legal, Commercial Counsel",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/8e87f48f-9643-4a87-87bf-c6fcd3336586?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7179677",
        "title": "Partner Development Manager (Alliances & Channels)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7179677",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7179658",
        "title": "Partner Development Manager (Alliances & Channels)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7179658",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1c85e4c7-b6b9-444c-b922-4335a468a09c?utm_source=jobs.a16z.com",
        "title": "Customer Success Manager I | EMEA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1c85e4c7-b6b9-444c-b922-4335a468a09c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7179780",
        "title": "Strategic Programs Lead, Operations & GTM",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7179780",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7165710",
        "title": "Manager, Solutions Architects (Revenue Suite)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7165710",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7176655",
        "title": "Partner Development Manager, Revenue and Finance Automation",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7176655",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7173211",
        "title": "Mobile Engineer (Android)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7173211",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6688690003",
        "title": "Senior Analytics Engineer I",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6688690003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7142550",
        "title": "Team Lead Technical Operations, Stripe Delivery Center",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7142550",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=6740752",
        "title": "Solutions Architect, Startup & SMB",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=6740752",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7173883",
        "title": "GTM Risk and Compliance Specialist",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7173883",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7177614",
        "title": "Program Strategist, GTM Risk",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7177614",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7177599",
        "title": "GTM Enterprise Risk Program Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7177599",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/01bda57e-9cd8-4bb4-a0d2-d7e5bb629ac1?utm_source=jobs.a16z.com",
        "title": "Accountant",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/01bda57e-9cd8-4bb4-a0d2-d7e5bb629ac1?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/6fc542d6-604b-4a87-a3c5-65b0813f58e9?utm_source=jobs.a16z.com",
        "title": "CRM Marketing Manager | Global",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/6fc542d6-604b-4a87-a3c5-65b0813f58e9?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/c8f85cff-0969-4209-bd5b-8c15a0f1047d?utm_source=jobs.a16z.com",
        "title": "Senior Partner Marketing Manager | Campaigns",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/c8f85cff-0969-4209-bd5b-8c15a0f1047d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1d5013ce-a07f-4c80-bfe8-a5c4e4f19d54?utm_source=jobs.a16z.com",
        "title": "Account Executive, Mid-Market | Japan",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1d5013ce-a07f-4c80-bfe8-a5c4e4f19d54?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://branchinternational.applytojob.com/apply/gJW9tV73A0/Team-Lead-Lending-Lab",
        "title": "Team Lead, Lending Lab",
        "company": "Branch International",
        "link": "https://branchinternational.applytojob.com/apply/gJW9tV73A0/Team-Lead-Lending-Lab",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/e9dd08ab-1dff-4a70-a28a-e019c951f12a?utm_source=jobs.a16z.com",
        "title": "Senior CRM Marketing Manager | Global",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/e9dd08ab-1dff-4a70-a28a-e019c951f12a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/5824dfcd-da25-456b-b4bb-e11783251922?utm_source=jobs.a16z.com",
        "title": "Account Executive, Deel IT, SMB | EMEA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/5824dfcd-da25-456b-b4bb-e11783251922?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/c9c9e93a-6277-4ffb-9f21-5f92dc6230aa?utm_source=jobs.a16z.com",
        "title": "Senior Full Stack Engineer",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/c9c9e93a-6277-4ffb-9f21-5f92dc6230aa?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4593958006",
        "title": "Business Operations Senior Associate - Valon Mortgage",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4593958006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4593821006",
        "title": "Part Time Workplace Experience Manager (20 Hours Per Week)",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4593821006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7174299",
        "title": "Software Engineer, Security Cloud Expansion",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7174299",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4589810006",
        "title": "Director, Product Management (Default)",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4589810006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=6482046",
        "title": "Communications - International Programs and Campaigns",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=6482046",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7136797",
        "title": "Global Partnerships Counsel, APAC",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7136797",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/70b5eab7-1a0f-4f79-bfc1-2fd2a7b88bbc?lever-source%5B%5D=jobs.a16z.com",
        "title": "Strategic Sourcing Manager",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/70b5eab7-1a0f-4f79-bfc1-2fd2a7b88bbc?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7179634",
        "title": "Bridge - Operations Associate",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7179634",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/271f17e7-26fa-432a-bd32-8c5c6b27fd8f?utm_source=jobs.a16z.com",
        "title": "Senior Operations Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/271f17e7-26fa-432a-bd32-8c5c6b27fd8f?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/withclutch/031bc8bd-0e66-416d-986e-dc22ede440a4?utm_source=jobs.a16z.com",
        "title": "Engagement Manager",
        "company": "Clutch",
        "link": "https://jobs.ashbyhq.com/withclutch/031bc8bd-0e66-416d-986e-dc22ede440a4?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://branchinternational.applytojob.com/apply/5bIK2HNHXW/Backend-Engineer-Data",
        "title": "Backend Engineer - Data",
        "company": "Branch International",
        "link": "https://branchinternational.applytojob.com/apply/5bIK2HNHXW/Backend-Engineer-Data",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/d9547ed8-c10d-4c0a-b1b6-9b531e59ed82?utm_source=jobs.a16z.com",
        "title": "Senior Segment Marketing Manager | Start-ups",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/d9547ed8-c10d-4c0a-b1b6-9b531e59ed82?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/3afe47c5-f8ff-4fcb-8946-f23c54896b2c?utm_source=jobs.a16z.com",
        "title": "Senior ABM & Lifecycle Paid Ads Manager | Global Remote",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/3afe47c5-f8ff-4fcb-8946-f23c54896b2c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/98eadb41-140e-4cff-851c-e650b861b1a8?utm_source=jobs.a16z.com",
        "title": "Sales Develoment Representative, SMB | CEE",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/98eadb41-140e-4cff-851c-e650b861b1a8?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1a0defb6-c88b-444c-a128-fcc0d44e6b69?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | South Africa",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1a0defb6-c88b-444c-a128-fcc0d44e6b69?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/902d9221-d4c0-4756-ab99-c62fe62a6ef1?utm_source=jobs.a16z.com",
        "title": "Senior QA Automation Engineer | LATAM",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/902d9221-d4c0-4756-ab99-c62fe62a6ef1?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/c94b274f-490b-444f-86cf-a2dc8a82e439?utm_source=jobs.a16z.com",
        "title": "Director of Demand Generation",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/c94b274f-490b-444f-86cf-a2dc8a82e439?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/eef5c286-e727-4a37-ad15-629022a02950?utm_source=jobs.a16z.com",
        "title": "Senior Full Stack Engineer",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/eef5c286-e727-4a37-ad15-629022a02950?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/method/e125e1f5-fb12-40b3-886c-93f43b6af4d4?utm_source=jobs.a16z.com",
        "title": "Recruiter",
        "company": "Method",
        "link": "https://jobs.ashbyhq.com/method/e125e1f5-fb12-40b3-886c-93f43b6af4d4?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7139225",
        "title": "Product Support Specialist",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7139225",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7021605",
        "title": "Senior Leadership Recruiter, Engineering",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7021605",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/31c6d94c-2e32-401d-8207-6084bed2bc4d?lever-source%5B%5D=jobs.a16z.com",
        "title": "Risk Analyst - Plaid Transfer",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/31c6d94c-2e32-401d-8207-6084bed2bc4d?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/abada796-8467-4982-8af4-11183fc2288b?lever-source%5B%5D=jobs.a16z.com",
        "title": "Staff Product Security Engineer",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/abada796-8467-4982-8af4-11183fc2288b?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4593693006",
        "title": "Sr. Manager of Mortgage Lending Underwriting",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4593693006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/627b694b-0f18-4ac2-8e26-06e580d32526?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Product Manager, Safety Products",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/627b694b-0f18-4ac2-8e26-06e580d32526?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6682943003",
        "title": "Analyst, Consumer Compliance, Monitoring & Oversight",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6682943003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/propel/jobs/8120147002",
        "title": "State Partnerships Manager (Mid-Atlantic/Southeast)",
        "company": "Propel",
        "link": "https://job-boards.greenhouse.io/propel/jobs/8120147002",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7165781",
        "title": "Head of Consumer Marketing, Link",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7165781",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7154047",
        "title": "Staff Engineer, RFA Forward Deployed Engineering",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7154047",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5620422004",
        "title": "Senior Technical Treasury Specialist",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5620422004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://capitolis.com/careers/job/?gh_jid=6680105003",
        "title": "DevSecOps",
        "company": "Capitolis",
        "link": "https://capitolis.com/careers/job/?gh_jid=6680105003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6683762003",
        "title": "Digital Banking Relationship Manager",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6683762003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6670931003",
        "title": "Lead Product Manager, Valuations",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6670931003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/f2d43754-09ee-4af5-ac2b-c4f3ded8b5b2?utm_source=jobs.a16z.com",
        "title": "Employee Success Partner",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/f2d43754-09ee-4af5-ac2b-c4f3ded8b5b2?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/lightspark/2528b3a1-5409-46af-bd06-f9cc507e9a7b?utm_source=jobs.a16z.com",
        "title": "VP of Global Sales",
        "company": "Lightspark",
        "link": "https://jobs.ashbyhq.com/lightspark/2528b3a1-5409-46af-bd06-f9cc507e9a7b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6317747-jovem-aprendiz-implantacao-plataforma",
        "title": "Jovem Aprendiz - Implantação Plataforma",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6317747-jovem-aprendiz-implantacao-plataforma",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7076209",
        "title": "Engineering Manager, Solutions Engineering",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7076209",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4592935006",
        "title": "Senior Product Designer, Consumer",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4592935006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4592946006",
        "title": "Senior Product Designer, Servicing",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4592946006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7155895",
        "title": "Corporate Engineering Manager, Automations & Integrations",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7155895",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://current.com/careers/open-positions/?id=7164939&gh_jid=7164939",
        "title": "Senior Data Analyst, Banking",
        "company": "Current",
        "link": "https://current.com/careers/open-positions/?id=7164939&gh_jid=7164939",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6680858003",
        "title": "Analyst, AML/CFT & OFAC Compliance, Program Administration",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6680858003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6317688-jovem-aprendiz-atendimento-plataforma",
        "title": "Jovem Aprendiz - Atendimento Plataforma",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6317688-jovem-aprendiz-atendimento-plataforma",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://recruiterflow.com/coinswitch/jobs/554",
        "title": "Compliance Intern",
        "company": "CoinSwitch Kuber",
        "link": "https://recruiterflow.com/coinswitch/jobs/554",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/55eecfac-b1cc-4660-a728-ae840bc9a267?lever-source%5B%5D=jobs.a16z.com",
        "title": "Staff Software Engineer, Product",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/55eecfac-b1cc-4660-a728-ae840bc9a267?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=6882221",
        "title": "Vendor Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=6882221",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/phantom/a609ddf0-c696-4f4f-8124-2df8f1043d20?utm_source=jobs.a16z.com",
        "title": "Customer Support Specialist - Contractor",
        "company": "Phantom",
        "link": "https://jobs.ashbyhq.com/phantom/a609ddf0-c696-4f4f-8124-2df8f1043d20?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sardine/d6b999f1-7526-4637-9603-2fdef69c711e?utm_source=jobs.a16z.com",
        "title": "Senior Information Security Engineer",
        "company": "Sardine",
        "link": "https://jobs.ashbyhq.com/sardine/d6b999f1-7526-4637-9603-2fdef69c711e?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/phantom/5a9b7126-6846-4919-9813-18c461282464?utm_source=jobs.a16z.com",
        "title": "Senior Customer Support Agent (Cards & Banking, Live Chat)",
        "company": "Phantom",
        "link": "https://jobs.ashbyhq.com/phantom/5a9b7126-6846-4919-9813-18c461282464?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sardine/6da78a92-8f90-447a-8624-edb7fbadfb25?utm_source=jobs.a16z.com",
        "title": "Technical Product Manager - Banking Core Integration",
        "company": "Sardine",
        "link": "https://jobs.ashbyhq.com/sardine/6da78a92-8f90-447a-8624-edb7fbadfb25?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/mystenlabs/e75711eb-f829-4d11-bbe0-914267d954ef?utm_source=jobs.a16z.com",
        "title": "Senior Developer Relations Engineer",
        "company": "Mysten Labs",
        "link": "https://jobs.ashbyhq.com/mystenlabs/e75711eb-f829-4d11-bbe0-914267d954ef?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sardine/13c882a7-0a59-429e-9c08-451af7c73643?utm_source=jobs.a16z.com",
        "title": "Senior Application Security Engineer",
        "company": "Sardine",
        "link": "https://jobs.ashbyhq.com/sardine/13c882a7-0a59-429e-9c08-451af7c73643?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/972fa070-017c-4c49-bce0-70b632282ce9?lever-source%5B%5D=jobs.a16z.com",
        "title": "Event Marketing",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/972fa070-017c-4c49-bce0-70b632282ce9?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7168922",
        "title": "Manager, Sales Development",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7168922",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5618900004",
        "title": "Senior Customer Support Strategic Program Manager",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5618900004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/1aa616e2-2952-4759-9a12-8ec0e20ef7c0?lever-source%5B%5D=jobs.a16z.com",
        "title": "Attorney - Corporate Contracts (Contractor)",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/1aa616e2-2952-4759-9a12-8ec0e20ef7c0?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7172254",
        "title": "Finance & Strategy Analyst, Go-to-Market",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7172254",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5622047004",
        "title": "Solutions Architect - Hong Kong",
        "company": "LayerZero Labs",
        "link": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5622047004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5622042004",
        "title": "Partner Marketing Manager",
        "company": "LayerZero Labs",
        "link": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5622042004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5622041004",
        "title": "Vertical Marketing Manager - Institutions",
        "company": "LayerZero Labs",
        "link": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5622041004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5619112004",
        "title": "Senior Data Scientist - Finance",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5619112004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/0fc2492b-abc6-42a2-aa68-1e0cf6c9dd80?lever-source%5B%5D=jobs.a16z.com",
        "title": "Technical Account Manager",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/0fc2492b-abc6-42a2-aa68-1e0cf6c9dd80?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://current.com/careers/open-positions/?id=7162614&gh_jid=7162614",
        "title": "Data Analyst, Banking",
        "company": "Current",
        "link": "https://current.com/careers/open-positions/?id=7162614&gh_jid=7162614",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/f7f9de12-923f-4402-85dc-67f117d66542?lever-source%5B%5D=jobs.a16z.com",
        "title": "Financial Systems Lead",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/f7f9de12-923f-4402-85dc-67f117d66542?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://current.com/careers/open-positions/?id=7162038&gh_jid=7162038",
        "title": "Data Analyst, Banking",
        "company": "Current",
        "link": "https://current.com/careers/open-positions/?id=7162038&gh_jid=7162038",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/3b6318ca-cfa3-43ef-8acc-2baeebc1a10c?lever-source%5B%5D=jobs.a16z.com",
        "title": "TechOps Site Support",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/3b6318ca-cfa3-43ef-8acc-2baeebc1a10c?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5618835004",
        "title": "Senior Growth Editor",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5618835004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.cedar.com/open-roles/?gh_jid=7145153",
        "title": "Sr. Manager, Value Analytics",
        "company": "Cedar",
        "link": "https://www.cedar.com/open-roles/?gh_jid=7145153",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.cedar.com/open-roles/?gh_jid=7141871",
        "title": "Sr. Integration Support Engineer",
        "company": "Cedar",
        "link": "https://www.cedar.com/open-roles/?gh_jid=7141871",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/81a488bd-f046-412c-8a1e-09286409da68?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Slovenia",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/81a488bd-f046-412c-8a1e-09286409da68?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/52770635-c4dc-4412-a7ad-e8efa075f86f?utm_source=jobs.a16z.com",
        "title": "Project Manager, Accounting | EMEA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/52770635-c4dc-4412-a7ad-e8efa075f86f?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c068595b-fee3-4112-aa99-718832656a3a?utm_source=jobs.a16z.com",
        "title": "Senior Quality Assurance Engineer",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c068595b-fee3-4112-aa99-718832656a3a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/338c15fa-c117-4fd9-99e3-35b5ef9138c1?utm_source=jobs.a16z.com",
        "title": "Solutions Engineer, Global Payroll | North America",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/338c15fa-c117-4fd9-99e3-35b5ef9138c1?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/phantom/f14bb44e-3cea-4f3a-b8b1-3ad0d2ccee8f?utm_source=jobs.a16z.com",
        "title": "Head of Product",
        "company": "Phantom",
        "link": "https://jobs.ashbyhq.com/phantom/f14bb44e-3cea-4f3a-b8b1-3ad0d2ccee8f?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/977184cf-3f52-4252-a91f-5a312914f759?utm_source=jobs.a16z.com",
        "title": "Senior/Staff Fraud Engineer",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/977184cf-3f52-4252-a91f-5a312914f759?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7161271",
        "title": "Entity Controller",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7161271",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/9fa075c5-ebf5-4de5-a2ae-fb1d129cbf68?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Development Representative Intern (US)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/9fa075c5-ebf5-4de5-a2ae-fb1d129cbf68?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/f70c808f-4326-4e0e-a20c-792baddc869d?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Development Representative - Early in Career (Europe)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/f70c808f-4326-4e0e-a20c-792baddc869d?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/cc7bf36d-7736-43d6-b791-b0b9e35b492f?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Development Representative - Early in Career (China)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/cc7bf36d-7736-43d6-b791-b0b9e35b492f?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5617989004",
        "title": "Senior Data Scientist - Compliance",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5617989004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/958c630d-9f5d-46ea-b93f-ad2b8bbce176?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Trading Operations",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/958c630d-9f5d-46ea-b93f-ad2b8bbce176?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/d485de06-90e2-498e-bcd7-15c7d4810e7b?lever-source%5B%5D=jobs.a16z.com",
        "title": "Technical Operations Engineer",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/d485de06-90e2-498e-bcd7-15c7d4810e7b?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7158188",
        "title": "Portfolio Oversight & Analytics Manager, Stripe Capital",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7158188",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/548daa80-934c-4a4f-8e46-551dd0bcf347?lever-source%5B%5D=jobs.a16z.com",
        "title": "Mid-Market Account Executive - Europe",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/548daa80-934c-4a4f-8e46-551dd0bcf347?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/dfinity/jobs/8114249002",
        "title": "Marketing Campaign Manager - Caffeine.ai",
        "company": "DFINITY",
        "link": "https://job-boards.greenhouse.io/dfinity/jobs/8114249002",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5617333004",
        "title": "Senior Onboarding L&D Specialist",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5617333004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7172093",
        "title": "Data Engineer, People Solutions",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7172093",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7095463",
        "title": "Credit Risk Strategy Analyst, Portfolio and Policy Management",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7095463",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/08c6d583-5bba-4c56-81c2-9fd9991d7110?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Product Manager - Core Team",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/08c6d583-5bba-4c56-81c2-9fd9991d7110?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/9b6ac200-8517-4443-be93-87a33a191715?lever-source%5B%5D=jobs.a16z.com",
        "title": "Product Analyst - Integrations Team",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/9b6ac200-8517-4443-be93-87a33a191715?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7142155",
        "title": "SEO Marketing Manager, Stripe Docs",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7142155",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7142153",
        "title": "SEO Content Marketing Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7142153",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/3e1ccef2-446b-40a2-a65a-179d3bc6ab8c?utm_source=jobs.a16z.com",
        "title": "Account Executive, SMB | France",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/3e1ccef2-446b-40a2-a65a-179d3bc6ab8c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/5ed54eed-d24d-415e-afee-849d6d2d2636?utm_source=jobs.a16z.com",
        "title": "Team Lead, Payroll Implementation | LATAM",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/5ed54eed-d24d-415e-afee-849d6d2d2636?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9ecbd973-951a-4f73-975e-33abb71bb61e?utm_source=jobs.a16z.com",
        "title": "Associate Payroll Enablement Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9ecbd973-951a-4f73-975e-33abb71bb61e?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/6d904840-7357-420c-83cd-07f05aedd40c?utm_source=jobs.a16z.com",
        "title": "Workday Partner Director | USA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/6d904840-7357-420c-83cd-07f05aedd40c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/0a68db1a-de33-4713-ae2a-48cfa42963c8?utm_source=jobs.a16z.com",
        "title": "Sales Lead, South Cone",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/0a68db1a-de33-4713-ae2a-48cfa42963c8?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://careers.kula.ai/dapperlabs/12160",
        "title": "Junior Risk Analyst – Blockchain | Fintech | NFT",
        "company": "Dapper Labs",
        "link": "https://careers.kula.ai/dapperlabs/12160",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/ddb9a1d5-e4f8-40c8-b723-b3f7800993b1?utm_source=jobs.a16z.com",
        "title": "Alliance Director, Workday Practice | USA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/ddb9a1d5-e4f8-40c8-b723-b3f7800993b1?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://careers.kula.ai/dapperlabs/12161",
        "title": "Junior Compliance Analyst – Blockchain | Fintech | NFT",
        "company": "Dapper Labs",
        "link": "https://careers.kula.ai/dapperlabs/12161",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/7c696bb1-12e2-400f-a217-4f19abebae99?utm_source=jobs.a16z.com",
        "title": "Sales Lead, Singapore",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/7c696bb1-12e2-400f-a217-4f19abebae99?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/925dc9a0-297b-4397-8aa8-dddaf5f947b6?utm_source=jobs.a16z.com",
        "title": "Head of Talent Acquisition",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/925dc9a0-297b-4397-8aa8-dddaf5f947b6?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/method/b069aab5-083e-4212-9ec7-114d42a344e7?utm_source=jobs.a16z.com",
        "title": "VP of Finance & Operations",
        "company": "Method",
        "link": "https://jobs.ashbyhq.com/method/b069aab5-083e-4212-9ec7-114d42a344e7?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/61311a2d-3f2a-4b2f-828e-b53f26e2a696?utm_source=jobs.a16z.com",
        "title": "Partner Operations Lead",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/61311a2d-3f2a-4b2f-828e-b53f26e2a696?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/7671a095-15d8-4ae9-9f99-ee0a9f8b91ef?utm_source=jobs.a16z.com",
        "title": "Head of Market, South Cone",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/7671a095-15d8-4ae9-9f99-ee0a9f8b91ef?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/ff53d196-42ae-4567-8919-13d2b7ec6f77?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Accounting, Accounting Policy",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/ff53d196-42ae-4567-8919-13d2b7ec6f77?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7161441",
        "title": "Commercial Counsel",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7161441",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7141826",
        "title": "Major Financial Crimes & Insider Risk Investigator",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7141826",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7166893",
        "title": "Senior Mobile Engineer (Android)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7166893",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/e0e6319d-586b-4ee1-a063-b8324805ddd7?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Compliance, Blockchain Intelligence",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/e0e6319d-586b-4ee1-a063-b8324805ddd7?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7115730",
        "title": "Solutions Architect, Billing",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7115730",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7164002",
        "title": "Communications Operations Lead",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7164002",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7161275",
        "title": "Accounting Technologist, Business Systems Program Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7161275",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://recruiterflow.com/coinswitch/jobs/552",
        "title": "Senior Business Associate ( CoinSwitch )",
        "company": "CoinSwitch Kuber",
        "link": "https://recruiterflow.com/coinswitch/jobs/552",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bb349fda-7b81-48c2-aabe-c1990999d648?utm_source=jobs.a16z.com",
        "title": "Front-End Engineer | LATAM",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bb349fda-7b81-48c2-aabe-c1990999d648?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7126816",
        "title": "Product Designer, Money Management",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7126816",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/6a443ccf-4133-4ba0-aa1a-521f0701e338?utm_source=jobs.a16z.com",
        "title": "Senior Android Application Software Engineer, OrbMini",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/6a443ccf-4133-4ba0-aa1a-521f0701e338?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/8d8328c3-b02d-44df-a29b-ddce85c1ca0d?utm_source=jobs.a16z.com",
        "title": "Cloud Security Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/8d8328c3-b02d-44df-a29b-ddce85c1ca0d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/withclutch/edf02fbf-b06c-413b-87b4-75a0e16c733c?utm_source=jobs.a16z.com",
        "title": "Senior Product Manager, Platform/Identity",
        "company": "Clutch",
        "link": "https://jobs.ashbyhq.com/withclutch/edf02fbf-b06c-413b-87b4-75a0e16c733c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7c741ef1-6854-4435-b9ce-e470ec82e11e?utm_source=jobs.a16z.com",
        "title": "Customer Success Manager I | French Speaking",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7c741ef1-6854-4435-b9ce-e470ec82e11e?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/withclutch/c469a9bc-b3a8-4617-9acb-f431a90b6e01?utm_source=jobs.a16z.com",
        "title": "Senior Product Manager, Platform/Identity",
        "company": "Clutch",
        "link": "https://jobs.ashbyhq.com/withclutch/c469a9bc-b3a8-4617-9acb-f431a90b6e01?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/864d4c75-7df2-4826-9f96-add51fe9c60d?utm_source=jobs.a16z.com",
        "title": "Application (Web2) Security Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/864d4c75-7df2-4826-9f96-add51fe9c60d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/4b58a7cf-538a-44c7-908b-da8918348efb?utm_source=jobs.a16z.com",
        "title": "Web3 Security Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/4b58a7cf-538a-44c7-908b-da8918348efb?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7007897d-6365-4e19-b8cf-146a7499b0e1?utm_source=jobs.a16z.com",
        "title": "Product Data Analyst",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7007897d-6365-4e19-b8cf-146a7499b0e1?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/629fc064-9e87-4f10-b259-40207b23c521?utm_source=jobs.a16z.com",
        "title": "Executive Assistant Associate",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/629fc064-9e87-4f10-b259-40207b23c521?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bd2aa71d-41e9-491e-8ec3-75450e211ffa?utm_source=jobs.a16z.com",
        "title": "Sales Development Representative, Mid-Market | DACH",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bd2aa71d-41e9-491e-8ec3-75450e211ffa?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/f264689a-265d-4c67-867f-9ecdf63204ee?utm_source=jobs.a16z.com",
        "title": "Senior Director, Product Design",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/f264689a-265d-4c67-867f-9ecdf63204ee?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/ac8b6368-b85a-48ff-8e3a-0eac769eb0ff?utm_source=jobs.a16z.com",
        "title": "Strategic Partner Lead, Infrastructure",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/ac8b6368-b85a-48ff-8e3a-0eac769eb0ff?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9c739dfc-ca83-4627-87b7-a8704814d844?utm_source=jobs.a16z.com",
        "title": "Account Executive, Global Mobility - APAC - Mandarin Speaker",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9c739dfc-ca83-4627-87b7-a8704814d844?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7144207",
        "title": "Financial Crimes Program Manager (Governance & Testing)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7144207",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7161356",
        "title": "Staff Engineer, Connect Risk & Compliance",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7161356",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7116966",
        "title": "Employee Relations Specialist, EMEA",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7116966",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7015087",
        "title": "Product Manager, Usage Based Billing",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7015087",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7054200",
        "title": "Engineering Program Manager, Connect",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7054200",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7159265",
        "title": "Events Marketing Manager, Industry",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7159265",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6307327-assistente-de-atendimento",
        "title": "Assistente de Atendimento",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6307327-assistente-de-atendimento",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/8c6e1b32-ca9c-4519-bca9-e348876ebdc5?utm_source=jobs.a16z.com",
        "title": "Customer Support Country Specialist, Payroll",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/8c6e1b32-ca9c-4519-bca9-e348876ebdc5?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/4f39d716-9fc1-47ae-95c2-6cdd80f4d86d?utm_source=jobs.a16z.com",
        "title": "Payroll Expert Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/4f39d716-9fc1-47ae-95c2-6cdd80f4d86d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/3210ce48-0c7a-43f3-9aeb-77dd1f675100?utm_source=jobs.a16z.com",
        "title": "Senior Data Analyst - Marketing",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/3210ce48-0c7a-43f3-9aeb-77dd1f675100?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6306337-operador-de-cobranca-exclusiva-para-pcd-s",
        "title": "Operador de Cobrança (Exclusiva para PCD's)",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6306337-operador-de-cobranca-exclusiva-para-pcd-s",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7142057",
        "title": "Vendor Manager, Risk Operations",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7142057",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7164051",
        "title": "Staff Product Designer, Developer AI",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7164051",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7156230",
        "title": "Senior Marketing Strategist, Product",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7156230",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/56aedded-c959-4488-b265-5cc42a182dca?lever-source%5B%5D=jobs.a16z.com",
        "title": "Communications Manager",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/56aedded-c959-4488-b265-5cc42a182dca?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7144205",
        "title": "Regulatory Compliance Program Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7144205",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5616373004",
        "title": "Senior Model Risk Manager",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5616373004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5616371004",
        "title": "Senior Backend Engineer - Accounting",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5616371004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://current.com/careers/open-positions/?id=7155604&gh_jid=7155604",
        "title": "Senior Analytics Engineer",
        "company": "Current",
        "link": "https://current.com/careers/open-positions/?id=7155604&gh_jid=7155604",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6673539003",
        "title": "Deal Desk Analyst",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6673539003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7060508",
        "title": "People Specialist, APAC",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7060508",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7157231",
        "title": "Accounting Analyst - MaaS Accounting",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7157231",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7142689",
        "title": "Complex Financial Crimes Investigator (Crypto)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7142689",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/7fee353e-9353-4cf8-8d81-bab6a1feb307?utm_source=jobs.a16z.com",
        "title": "Threat Intelligence Researcher",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/7fee353e-9353-4cf8-8d81-bab6a1feb307?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Lido.fi/74b1a7bb-c906-4876-85a1-a191bc7be70a?utm_source=jobs.a16z.com",
        "title": "Institutional Growth Lead – USA",
        "company": "Lido",
        "link": "https://jobs.ashbyhq.com/Lido.fi/74b1a7bb-c906-4876-85a1-a191bc7be70a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/85f8c4f7-6125-4d44-8c44-2367a46cc5e2?utm_source=jobs.a16z.com",
        "title": "World Space Senior Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/85f8c4f7-6125-4d44-8c44-2367a46cc5e2?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/78e372c5-6966-4288-a574-5f672b3fb194?utm_source=jobs.a16z.com",
        "title": "Fulfilment Operations Associate | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/78e372c5-6966-4288-a574-5f672b3fb194?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1556c438-7038-43f9-9157-add4fc41b5af?utm_source=jobs.a16z.com",
        "title": "Back-End Engineer - Infrastructure Team",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1556c438-7038-43f9-9157-add4fc41b5af?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Lido.fi/0f1d028b-d6b3-48ed-8a1c-fa676e1ca6c8?utm_source=jobs.a16z.com",
        "title": "Compliance Lead",
        "company": "Lido",
        "link": "https://jobs.ashbyhq.com/Lido.fi/0f1d028b-d6b3-48ed-8a1c-fa676e1ca6c8?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Runway/0230526b-98a5-4786-8f00-ab472f33a191?utm_source=jobs.a16z.com",
        "title": "Controller",
        "company": "Runway",
        "link": "https://jobs.ashbyhq.com/Runway/0230526b-98a5-4786-8f00-ab472f33a191?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1518c47d-90db-48ee-9933-bc57e5ce97d8?utm_source=jobs.a16z.com",
        "title": "Manager, Customer Success, SMB",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1518c47d-90db-48ee-9933-bc57e5ce97d8?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7139223",
        "title": "Terminal Logistics Program Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7139223",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/4210ab0f-d495-4157-9679-944d65db9917?utm_source=jobs.a16z.com",
        "title": "Account Executive, Mid-Market | North America",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/4210ab0f-d495-4157-9679-944d65db9917?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7013220",
        "title": "Velocity Grower Sales Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7013220",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7155899",
        "title": "Implementation Consultant, Billing",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7155899",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4590749006",
        "title": "Manager of Funding/CLosing",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4590749006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5615358004",
        "title": "Manager, Internal Audit",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5615358004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6675178003",
        "title": "VP, Business Risk Unit",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6675178003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6675219003",
        "title": "VP, Privacy Compliance",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6675219003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/1e5eec65-94f7-4d0a-9269-857f35503850?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Database Administrator",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/1e5eec65-94f7-4d0a-9269-857f35503850?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://current.com/careers/open-positions/?id=7144761&gh_jid=7144761",
        "title": "Senior Software Engineer, Infrastructure",
        "company": "Current",
        "link": "https://current.com/careers/open-positions/?id=7144761&gh_jid=7144761",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6296482-analista-de-experiencia",
        "title": "Analista de Experiência",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6296482-analista-de-experiencia",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7155907",
        "title": "Integration Engineer, Stablecoin",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7155907",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/avalabs/jobs/5611660004",
        "title": "Mergers & Acquisitions Lead",
        "company": "Ava Labs",
        "link": "https://job-boards.greenhouse.io/avalabs/jobs/5611660004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7141990",
        "title": "Staff Product Manager",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7141990",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/wingspan/jobs/6674467003",
        "title": "Sales Development Representative",
        "company": "Wingspan",
        "link": "https://job-boards.greenhouse.io/wingspan/jobs/6674467003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6672873003",
        "title": "Associate, CRE Portfolio Management",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6672873003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7140915",
        "title": "Director, Customer Care Product Operations",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7140915",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6673615003",
        "title": "Analyst, AML/CFT & OFAC Compliance, FIU, Suspicious Activity Monitoring",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6673615003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5612143004",
        "title": "Senior Full-Stack Engineer - Risk Experience",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5612143004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6293488-operador-de-cobranca",
        "title": "Operador de Cobrança",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6293488-operador-de-cobranca",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/6c4b7542-7e1a-4f67-a812-bf92171a03eb?utm_source=jobs.a16z.com",
        "title": "Backend Engineer - Stablecoins",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/6c4b7542-7e1a-4f67-a812-bf92171a03eb?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/cf968a1b-e077-4111-8c00-9787195c9587?utm_source=jobs.a16z.com",
        "title": "Full Cycle Recruiter",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/cf968a1b-e077-4111-8c00-9787195c9587?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/OpenSea/4d81b74a-8ecd-4e45-bd30-19eb4c326c8c?utm_source=jobs.a16z.com",
        "title": "Creative AI Content Producer",
        "company": "OpenSea",
        "link": "https://jobs.ashbyhq.com/OpenSea/4d81b74a-8ecd-4e45-bd30-19eb4c326c8c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7131896",
        "title": "Software Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7131896",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/8bec0191-f7d1-421e-844f-1a046845f9bd?utm_source=jobs.a16z.com",
        "title": "Account Executive, Enterprise | Italy",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/8bec0191-f7d1-421e-844f-1a046845f9bd?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/347b34d7-3ff0-4db7-9822-a1bfbfaa68b7?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Global Markets, Weekend Sales & Trading",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/347b34d7-3ff0-4db7-9822-a1bfbfaa68b7?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7125787",
        "title": "Senior Mobile Engineer (Android)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7125787",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7115178",
        "title": "Technical Program Manager, MMS",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7115178",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/3db63d5e-4285-4cfa-9c39-69f5d19eaf0f?lever-source%5B%5D=jobs.a16z.com",
        "title": "Technical Account Manager",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/3db63d5e-4285-4cfa-9c39-69f5d19eaf0f?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7120764",
        "title": "Product Counsel, Lending",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7120764",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=6816274",
        "title": "Finance & Strategy Analyst",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=6816274",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/dfinity/jobs/8111812002",
        "title": "Senior Site Reliability Engineer - Caffeinea.ai",
        "company": "DFINITY",
        "link": "https://job-boards.greenhouse.io/dfinity/jobs/8111812002",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7141980",
        "title": "Chief of Staff, Global Partnerships",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7141980",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6675196003",
        "title": "Analyst, Asset Management Loan Servicing",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6675196003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7026055",
        "title": "F&S Specialist",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7026055",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/4e559775-9c5a-4d81-949f-9c1737e86976?utm_source=jobs.a16z.com",
        "title": "Strategic Account Executive",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/4e559775-9c5a-4d81-949f-9c1737e86976?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c68dbca5-2927-46e3-8b24-a9c9a2847925?utm_source=jobs.a16z.com",
        "title": "HR Business Partner",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c68dbca5-2927-46e3-8b24-a9c9a2847925?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7b82cb7d-8646-4879-bc96-2a614fced53d?utm_source=jobs.a16z.com",
        "title": "Account Executive, Expansion, SMB | UK&I",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7b82cb7d-8646-4879-bc96-2a614fced53d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/587cd202-756d-4a3a-8ae5-7dcde64e12a8?utm_source=jobs.a16z.com",
        "title": "Sales Development Representative, Enterprise | Benelux",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/587cd202-756d-4a3a-8ae5-7dcde64e12a8?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://apply.workable.com/j/F0FE188CDC",
        "title": "Affiliate Manager (Part-Time) - Otherworld Crypto Casino",
        "company": "Everyrealm",
        "link": "https://apply.workable.com/j/F0FE188CDC",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/4c22675a-9604-4425-a5b7-bc41786ec0e9?utm_source=jobs.a16z.com",
        "title": "Security Engineer, Detection & Response",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/4c22675a-9604-4425-a5b7-bc41786ec0e9?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/f7af86f0-4373-4eb1-a56b-216a9b60ea7b?utm_source=jobs.a16z.com",
        "title": "Senior Product Engineer, Full Stack",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/f7af86f0-4373-4eb1-a56b-216a9b60ea7b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/96e12569-1f90-49e8-aeeb-bee19c5c1a83?utm_source=jobs.a16z.com",
        "title": "Payroll Specialist | France",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/96e12569-1f90-49e8-aeeb-bee19c5c1a83?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/OpenSea/67c67893-f7f7-44e9-8a94-976c4a5f2a86?utm_source=jobs.a16z.com",
        "title": "Staff Android Engineer",
        "company": "OpenSea",
        "link": "https://jobs.ashbyhq.com/OpenSea/67c67893-f7f7-44e9-8a94-976c4a5f2a86?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/43b1374d-5c5e-4b63-b710-a95e3cb76bbe?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Software Engineer - Credit ML Products",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/43b1374d-5c5e-4b63-b710-a95e3cb76bbe?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/1d3a494a-ca7d-4b25-afc5-dc32ce1fc50d?lever-source%5B%5D=jobs.a16z.com",
        "title": "Product Marketing Manager - Payments",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/1d3a494a-ca7d-4b25-afc5-dc32ce1fc50d?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4589896006",
        "title": "Senior Data Analyst, Valon Mortgage",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4589896006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7144975",
        "title": "Design Engineer, Presence",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7144975",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7138537",
        "title": "Pricing Analyst - Deal Pricing Tooling & Analytics",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7138537",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://recruiterflow.com/coinswitch/jobs/550",
        "title": "Senior Business Associate ( Lemonn )",
        "company": "CoinSwitch Kuber",
        "link": "https://recruiterflow.com/coinswitch/jobs/550",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4590207006",
        "title": "Content Strategy Lead",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4590207006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/nansen/jobs/5614418004",
        "title": "Data Engineer",
        "company": "Nansen",
        "link": "https://job-boards.greenhouse.io/nansen/jobs/5614418004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7140002",
        "title": "Account Executive, SSMB",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7140002",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7130486",
        "title": "India / APAC Tax Analyst - Tax, APAC",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7130486",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/fcd4b58b-19fc-47f2-8c7a-a9aa149ebeb1?utm_source=jobs.a16z.com",
        "title": "Software Engineer Intern, Backend, Dealer",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/fcd4b58b-19fc-47f2-8c7a-a9aa149ebeb1?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/f035a438-3dde-4d4e-8349-e97e3017384a?utm_source=jobs.a16z.com",
        "title": "Software Engineer, Full Stack",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/f035a438-3dde-4d4e-8349-e97e3017384a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/0c150c16-ed0e-4f21-81d6-e85f67437f00?utm_source=jobs.a16z.com",
        "title": "Quantitative Analyst Intern",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/0c150c16-ed0e-4f21-81d6-e85f67437f00?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/2db01769-8f00-4652-b790-b7cff80bc891?utm_source=jobs.a16z.com",
        "title": "Software Engineer Intern, Front-End, PMS",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/2db01769-8f00-4652-b790-b7cff80bc891?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/17d32370-963c-4157-acc1-4e9cc9983779?utm_source=jobs.a16z.com",
        "title": "Client Services Intern, New York",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/17d32370-963c-4157-acc1-4e9cc9983779?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/c449d733-742e-4fa2-801d-cc757d4cbb98?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Denmark",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/c449d733-742e-4fa2-801d-cc757d4cbb98?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1cb4ad19-35c5-49dd-8c90-76cc169cace2?utm_source=jobs.a16z.com",
        "title": "Payroll Manager, US",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1cb4ad19-35c5-49dd-8c90-76cc169cace2?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/f3d358c4-54e2-4cc8-afe2-8474fa13320b?utm_source=jobs.a16z.com",
        "title": "Software Engineer Intern, Backend, PMS",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/f3d358c4-54e2-4cc8-afe2-8474fa13320b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/polychaincapital/jobs/7130183",
        "title": "Venture Research Analyst",
        "company": "Polychain Capital",
        "link": "https://job-boards.greenhouse.io/polychaincapital/jobs/7130183",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7120602",
        "title": "Manager, Partner Solutions Architect",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7120602",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/1358c175-3049-4faf-aa88-73781512dfaf?utm_source=jobs.a16z.com",
        "title": "World Spaces Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/1358c175-3049-4faf-aa88-73781512dfaf?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/ef9d4dfc-ea4f-4965-9469-546ea4df467c?utm_source=jobs.a16z.com",
        "title": "World Spaces Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/ef9d4dfc-ea4f-4965-9469-546ea4df467c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/fe036be1-5c7b-4f0d-967b-688d1b8347f9?lever-source%5B%5D=jobs.a16z.com",
        "title": "Staff Software Engineer - Credit ML Products",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/fe036be1-5c7b-4f0d-967b-688d1b8347f9?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7139182",
        "title": "Strategy & Operations, Card Networks",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7139182",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7128659",
        "title": "Proposal Lead",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7128659",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7099419",
        "title": "Solutions Architect, Platforms",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7099419",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/alchemy/jobs/4593927005",
        "title": "Sales Development Representative",
        "company": "Alchemy",
        "link": "https://job-boards.greenhouse.io/alchemy/jobs/4593927005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6276522-analista-de-credito-data-scientist",
        "title": "Analista de Crédito | Data scientist",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6276522-analista-de-credito-data-scientist",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/55080599-aa47-418e-bc86-4b2baf7a100b?utm_source=jobs.a16z.com",
        "title": "Go-To-Market Lead",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/55080599-aa47-418e-bc86-4b2baf7a100b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/6c134303-b93d-47c9-b326-61b9180b26f8?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Security GRC Analyst",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/6c134303-b93d-47c9-b326-61b9180b26f8?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=6802726",
        "title": "Product Strategy & Operations - Global & Local Payment Methods",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=6802726",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7137787",
        "title": "Security Investigations Analyst - SIRE",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7137787",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=6735940",
        "title": "Account Executive, SMB (New Business)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=6735940",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7130559",
        "title": "Sales Manager, Funded Startups - German Speaking",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7130559",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/2b291beb-a097-4426-8f5b-914b8903f29a?utm_source=jobs.a16z.com",
        "title": "Sr. Manager, Capital Markets - Transactions",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/2b291beb-a097-4426-8f5b-914b8903f29a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/676f2e71-f40d-42c1-9ebb-4148fbf48df7?utm_source=jobs.a16z.com",
        "title": "Growth Lead Merchant Engagement",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/676f2e71-f40d-42c1-9ebb-4148fbf48df7?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://branchinternational.applytojob.com/apply/zrevveTcf5/Compliance-Associate",
        "title": "Compliance Associate",
        "company": "Branch International",
        "link": "https://branchinternational.applytojob.com/apply/zrevveTcf5/Compliance-Associate",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/bae3b733-ac0f-4236-be75-6ef3e9127842?utm_source=jobs.a16z.com",
        "title": "VP of Enterprise Sales",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/bae3b733-ac0f-4236-be75-6ef3e9127842?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7126646",
        "title": "Staff Software Engineer, Search - Data Platform",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7126646",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6286077-analista-de-remuneracao-e-beneficios-pl",
        "title": "Analista de Remuneração e Benefícios PL",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6286077-analista-de-remuneracao-e-beneficios-pl",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/8badf24f-da5b-491c-994f-209b48f8e6a1?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (Swedish Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/8badf24f-da5b-491c-994f-209b48f8e6a1?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/92c9b733-75f5-4392-ab4c-30306db7b962?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (Dutch Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/92c9b733-75f5-4392-ab4c-30306db7b962?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/36016227-cce2-494b-bbd8-78b479a1030a?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (French Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/36016227-cce2-494b-bbd8-78b479a1030a?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/c75c8c5f-6cad-482a-8902-2f4b108048be?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (UK)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/c75c8c5f-6cad-482a-8902-2f4b108048be?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/041c3bae-f5fa-4862-899a-25e74ef313f4?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (Italian Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/041c3bae-f5fa-4862-899a-25e74ef313f4?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/d6357a38-6d6e-4384-8933-7ba55fcb5a32?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (German Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/d6357a38-6d6e-4384-8933-7ba55fcb5a32?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7125206",
        "title": "University Recruiter (Fixed Term Contract)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7125206",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7125771",
        "title": "Senior Software Development Engineer Test (Mobile Automation)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7125771",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6272470-sdr-outbound",
        "title": "SDR - Outbound",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6272470-sdr-outbound",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6653349003",
        "title": "Public Policy Analyst",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6653349003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7108249",
        "title": "Account Executive, Enterprise (Sao Paulo, Brazil)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7108249",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.morpho.org/o/legal-manager-1",
        "title": "Legal Manager",
        "company": "Morpho Labs",
        "link": "https://jobs.morpho.org/o/legal-manager-1",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7131826",
        "title": "Sales Manager, Platforms",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7131826",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7140921",
        "title": "Account Executive, SMB (Existing Business)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7140921",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6673619003",
        "title": "APAC & MENA Sales Development Representative Intern",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6673619003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7135264",
        "title": "Accounting Analyst - Product Accounting - Processing Cost",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7135264",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7075436",
        "title": "Product Manager, Connect",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7075436",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=6703365",
        "title": "Tech Operations, Integration Reliability Engineer",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=6703365",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/529c3fe4-f606-44f9-86a7-7ffa8cfb1da4?utm_source=jobs.a16z.com",
        "title": "IT Engineer, Deel IT | LATAM",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/529c3fe4-f606-44f9-86a7-7ffa8cfb1da4?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7124531",
        "title": "Staff Engineer, Usage Based Billing",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7124531",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bc4957cb-5a9a-4a66-a53b-8b24d7edd875?utm_source=jobs.a16z.com",
        "title": "Senior Manager, Payroll | South Africa",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bc4957cb-5a9a-4a66-a53b-8b24d7edd875?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/e3b9c3f4-5cb2-4533-b4d6-3f5d9771fc2f?utm_source=jobs.a16z.com",
        "title": "Associate Director, People Operations",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/e3b9c3f4-5cb2-4533-b4d6-3f5d9771fc2f?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/d4872706-8cba-452e-9dba-95a339348d82?utm_source=jobs.a16z.com",
        "title": "Sales Development Representative, Mobility | Turkey",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/d4872706-8cba-452e-9dba-95a339348d82?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/4d901a14-09e5-4350-943f-9a788071a306?utm_source=jobs.a16z.com",
        "title": "Product Data Analyst",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/4d901a14-09e5-4350-943f-9a788071a306?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7134912",
        "title": "Strategy and Operations Lead, Self Serve",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7134912",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7125760",
        "title": "GTM Operations Territory Lead",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7125760",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/f90ad92a-f882-4bec-8a27-cc22d7da843b?lever-source%5B%5D=jobs.a16z.com",
        "title": "Account Executive, Financial Institutions",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/f90ad92a-f882-4bec-8a27-cc22d7da843b?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/tryjeeves/485c59da-634e-4be4-89c4-bd7413237bf6?lever-source%5B%5D=jobs.a16z.com",
        "title": "Account Executive",
        "company": "Jeeves",
        "link": "https://jobs.lever.co/tryjeeves/485c59da-634e-4be4-89c4-bd7413237bf6?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/tryjeeves/dc80fea9-3432-44ba-9f52-aa33f713b137?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Development Representative",
        "company": "Jeeves",
        "link": "https://jobs.lever.co/tryjeeves/dc80fea9-3432-44ba-9f52-aa33f713b137?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/e87f2c3d-31a5-48b6-8c6e-5db611fa535c?lever-source%5B%5D=jobs.a16z.com",
        "title": "Junior Quantitative Researcher, Trading",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/e87f2c3d-31a5-48b6-8c6e-5db611fa535c?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/40521504-758c-4302-96c6-41f4f6b5110d?utm_source=jobs.a16z.com",
        "title": "Software Engineer Intern, Connectivity",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/40521504-758c-4302-96c6-41f4f6b5110d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7088616",
        "title": "Backend Engineer",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7088616",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/e66ee272-aaaa-42d7-8904-9ac029adca3d?utm_source=jobs.a16z.com",
        "title": "Fraud Quality & Continuous Improvement Analyst",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/e66ee272-aaaa-42d7-8904-9ac029adca3d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/041ad8e6-892f-4a92-b086-4fb159d86962?utm_source=jobs.a16z.com",
        "title": "Senior Partnerships Manager | ANZ",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/041ad8e6-892f-4a92-b086-4fb159d86962?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7091959",
        "title": "Staff Frontend Engineer",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7091959",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/e86d4330-54e8-4bdc-8398-70cb5f751eed?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Argentina",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/e86d4330-54e8-4bdc-8398-70cb5f751eed?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/a8c52399-43ce-4e22-9451-ef8d20f518dd?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/a8c52399-43ce-4e22-9451-ef8d20f518dd?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://recruiterflow.com/coinswitch/jobs/549",
        "title": "Associate Manager - Compliance",
        "company": "CoinSwitch Kuber",
        "link": "https://recruiterflow.com/coinswitch/jobs/549",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6668008003",
        "title": "Accounts Receivable Accountant",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6668008003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/e689b2bd-c99a-4d87-a9ac-bf9aefc35513?utm_source=jobs.a16z.com",
        "title": "Client Services Intern, London",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/e689b2bd-c99a-4d87-a9ac-bf9aefc35513?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/20de3e06-b144-4bcc-bdd0-19304295ae16?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/20de3e06-b144-4bcc-bdd0-19304295ae16?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Solana%20Foundation/6be29283-a2e0-48f4-b388-d06f48e240b3?utm_source=jobs.a16z.com",
        "title": "Solana Program Engineer",
        "company": "Solana Foundation",
        "link": "https://jobs.ashbyhq.com/Solana%20Foundation/6be29283-a2e0-48f4-b388-d06f48e240b3?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/72badd5f-65c5-43e7-889e-ad6315cdd9d2?utm_source=jobs.a16z.com",
        "title": "Payroll Associate | Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/72badd5f-65c5-43e7-889e-ad6315cdd9d2?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/0b0fc350-cc06-42ee-bfc7-b9b02f6e9e10?utm_source=jobs.a16z.com",
        "title": "Senior Manager, Account Executive, Mobility, Enterprise | North America",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/0b0fc350-cc06-42ee-bfc7-b9b02f6e9e10?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1e2cb7b5-8ec3-4e1e-a64f-599d2e762b3a?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1e2cb7b5-8ec3-4e1e-a64f-599d2e762b3a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/eecdd936-e6df-442a-9538-73fc72fa7af5?utm_source=jobs.a16z.com",
        "title": "Chief of Staff to the COO",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/eecdd936-e6df-442a-9538-73fc72fa7af5?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/4111bcc1-c02d-4122-a1bc-839eda0fefa4?utm_source=jobs.a16z.com",
        "title": "Client Services Intern, Singapore",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/4111bcc1-c02d-4122-a1bc-839eda0fefa4?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/28db7efc-7956-40a8-b3d2-761f813cb78d?utm_source=jobs.a16z.com",
        "title": "Legal Counsel | Nordics",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/28db7efc-7956-40a8-b3d2-761f813cb78d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/ef92db32-3e2a-4ec0-ad40-6ac083322366?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/ef92db32-3e2a-4ec0-ad40-6ac083322366?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/563d8d3a-0c59-4660-b540-6d2f78abe8ad?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/563d8d3a-0c59-4660-b540-6d2f78abe8ad?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/eigen-labs/555aa727-9756-47ef-bd3d-61401c2bc86b?utm_source=jobs.a16z.com",
        "title": "Senior Accountant",
        "company": "EigenLayer",
        "link": "https://jobs.ashbyhq.com/eigen-labs/555aa727-9756-47ef-bd3d-61401c2bc86b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/bd309130-9ff0-4d84-8878-20a05f0c1e58?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Software Engineer - Python Tooling & Developer Infrastructure",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/bd309130-9ff0-4d84-8878-20a05f0c1e58?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/a31952af-be3d-4495-9638-888673c40424?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Engineer Manager - SMB",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/a31952af-be3d-4495-9638-888673c40424?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7104344",
        "title": "Developer Experience Engineer, Privy",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7104344",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/98247648-3415-4a74-a28e-1ec425b0ad71?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Engineer - SMB",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/98247648-3415-4a74-a28e-1ec425b0ad71?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/uniswaplabs/jobs/4586390005",
        "title": "Senior Design Lead",
        "company": "UniSwap",
        "link": "https://job-boards.greenhouse.io/uniswaplabs/jobs/4586390005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602673004",
        "title": "Compliance Risk Manager - Investments",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602673004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602671004",
        "title": "Senior Internal Auditor",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602671004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7091957",
        "title": "Founding Product Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7091957",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4589062006",
        "title": "Forward Deployed Engineer",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4589062006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.cedar.com/open-roles/?gh_jid=7118065",
        "title": "Sr. Group Lead, Implementation",
        "company": "Cedar",
        "link": "https://www.cedar.com/open-roles/?gh_jid=7118065",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602375004",
        "title": "Senior IT Auditor",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602375004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602361004",
        "title": "Compliance Training Program Manager",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602361004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/d4e5cf76-da8c-4af7-93eb-4237e0905d1b?utm_source=jobs.a16z.com",
        "title": "Fraud Trainer",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/d4e5cf76-da8c-4af7-93eb-4237e0905d1b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/phantom/a7429fbb-7aa4-4901-916a-8ab06e0d091c?utm_source=jobs.a16z.com",
        "title": "Product Marketer",
        "company": "Phantom",
        "link": "https://jobs.ashbyhq.com/phantom/a7429fbb-7aa4-4901-916a-8ab06e0d091c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602192004",
        "title": "Senior Card Fraud Investigator",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602192004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/momentmarkets/jobs/4806433007",
        "title": "People Operations Associate",
        "company": "Moment",
        "link": "https://job-boards.greenhouse.io/momentmarkets/jobs/4806433007",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4588927006",
        "title": "Counsel",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4588927006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7104148",
        "title": "Security Engineer, Privy",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7104148",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6644889003",
        "title": "Associate, Talent Management Specialist",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6644889003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/uniswaplabs/jobs/4590829005",
        "title": "Senior Data Scientist",
        "company": "UniSwap",
        "link": "https://job-boards.greenhouse.io/uniswaplabs/jobs/4590829005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/propel/jobs/8098808002",
        "title": "Senior Growth Marketing Manager",
        "company": "Propel",
        "link": "https://job-boards.greenhouse.io/propel/jobs/8098808002",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/avalabs/jobs/5601116004",
        "title": "Senior Software Engineer, Core Web",
        "company": "Ava Labs",
        "link": "https://job-boards.greenhouse.io/avalabs/jobs/5601116004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4588897006",
        "title": "Default Analyst - Bankruptcy",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4588897006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/a0d99be2-3c2f-459b-b09e-658c7e484120?lever-source%5B%5D=jobs.a16z.com",
        "title": "Engineering Manager, Product Foundations",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/a0d99be2-3c2f-459b-b09e-658c7e484120?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Adaptive/13157967-3db1-4360-9be5-2313706f74be?utm_source=jobs.a16z.com",
        "title": "Growth Engineer",
        "company": "Adaptive",
        "link": "https://jobs.ashbyhq.com/Adaptive/13157967-3db1-4360-9be5-2313706f74be?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/78f2ad3e-3730-45ad-91d1-605f80706fd8?utm_source=jobs.a16z.com",
        "title": "Associate Operations Manager, GTM Strategy",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/78f2ad3e-3730-45ad-91d1-605f80706fd8?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/18bd79de-2958-412e-b19c-94d13ecc78e7?utm_source=jobs.a16z.com",
        "title": "Staff Mechanical Engineer, Device",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/18bd79de-2958-412e-b19c-94d13ecc78e7?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/method/a379babd-9e7d-483e-a052-6e8dbd0f1cbc?utm_source=jobs.a16z.com",
        "title": "Design Engineer",
        "company": "Method",
        "link": "https://jobs.ashbyhq.com/method/a379babd-9e7d-483e-a052-6e8dbd0f1cbc?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/f4babda9-189f-43c3-8bdc-66cfbe8d4a61?lever-source%5B%5D=jobs.a16z.com",
        "title": "Marketing Technology Manager",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/f4babda9-189f-43c3-8bdc-66cfbe8d4a61?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/paveakatroveinformationtechnologies/jobs/4591397005",
        "title": "Deal Desk Analyst",
        "company": "Pave",
        "link": "https://job-boards.greenhouse.io/paveakatroveinformationtechnologies/jobs/4591397005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/0be386af-bae2-4e0e-a7d3-3b104cf9e753?utm_source=jobs.a16z.com",
        "title": "Accountant I",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/0be386af-bae2-4e0e-a7d3-3b104cf9e753?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/2a38cb22-52ee-4b13-bb04-0d0b1e1841f1?utm_source=jobs.a16z.com",
        "title": "Senior Customer Success Manager, Enterprise | EMEA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/2a38cb22-52ee-4b13-bb04-0d0b1e1841f1?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7088619",
        "title": "Backend Engineer, Privy",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7088619",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/664479d6-fecc-423c-8763-2d0986c137e1?lever-source%5B%5D=jobs.a16z.com",
        "title": "Product Marketing Manager - Europe",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/664479d6-fecc-423c-8763-2d0986c137e1?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/710aeb62-d457-4424-84b6-4ee133fafe37?lever-source%5B%5D=jobs.a16z.com",
        "title": "Growth Marketing Manager - Europe",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/710aeb62-d457-4424-84b6-4ee133fafe37?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6666584003",
        "title": "Analyst, MPL Accounting",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6666584003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7126390",
        "title": "Manager, Customer Success",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7126390",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7100525",
        "title": "Integration Reliability Engineer, Technical Operations",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7100525",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7cebc6de-d064-4a84-8d07-c05d7786562c?utm_source=jobs.a16z.com",
        "title": "Payroll Analyst | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7cebc6de-d064-4a84-8d07-c05d7786562c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/blackbird/jobs/4588662006",
        "title": "Field Operations Contractor",
        "company": "Blackbird",
        "link": "https://job-boards.greenhouse.io/blackbird/jobs/4588662006",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/74accf80-9949-4bc9-8b6a-dce116b5d51d?utm_source=jobs.a16z.com",
        "title": "Sales Lead, South Korea",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/74accf80-9949-4bc9-8b6a-dce116b5d51d?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/d61d48f4-0ae2-4f9f-bbe5-a9116c2bb79b?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Associate, Australia Payroll | Philippines & India",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/d61d48f4-0ae2-4f9f-bbe5-a9116c2bb79b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/9335b34f-a930-497f-bece-bca4c19506c1?utm_source=jobs.a16z.com",
        "title": "Corporate Strategy, Manager",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/9335b34f-a930-497f-bece-bca4c19506c1?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/b02322bd-c9c8-4067-bf60-1bb4cf98b8bd?utm_source=jobs.a16z.com",
        "title": "Payroll Service Delivery Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/b02322bd-c9c8-4067-bf60-1bb4cf98b8bd?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/43b1d0bd-94de-4d8a-aaea-cae67e03da2a?utm_source=jobs.a16z.com",
        "title": "Data Science Manager",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/43b1d0bd-94de-4d8a-aaea-cae67e03da2a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/tryjeeves/e6594e1f-1387-4556-a98c-7a31e9e03b4f?lever-source%5B%5D=jobs.a16z.com",
        "title": "Graphic Designer (Video & Social)",
        "company": "Jeeves",
        "link": "https://jobs.lever.co/tryjeeves/e6594e1f-1387-4556-a98c-7a31e9e03b4f?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/793d387f-ac66-4787-a383-3f9891c04551?lever-source%5B%5D=jobs.a16z.com",
        "title": "Backend Developer - Integrations",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/793d387f-ac66-4787-a383-3f9891c04551?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/da3c7b3f-edf7-4012-84f9-afdde7a607ed?lever-source%5B%5D=jobs.a16z.com",
        "title": "Technical Support Analyst",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/da3c7b3f-edf7-4012-84f9-afdde7a607ed?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.eu.greenhouse.io/gensyn/jobs/4648121101",
        "title": "Developer Advocate",
        "company": "Gensyn",
        "link": "https://job-boards.eu.greenhouse.io/gensyn/jobs/4648121101",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://wellfound.com/jobs/1028075-qa-engineer",
        "title": "QA Engineer",
        "company": "Tellus",
        "link": "https://wellfound.com/jobs/1028075-qa-engineer",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://wellfound.com/jobs/3351333-ios-developer-remote-friendly",
        "title": "iOS Developer (Remote Friendly)",
        "company": "Tellus",
        "link": "https://wellfound.com/jobs/3351333-ios-developer-remote-friendly",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7120766",
        "title": "Specialist Solutions Architect, Crypto & Stablecoins",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7120766",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7123614",
        "title": "Investor Relations",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7123614",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6249498-senior-application-security",
        "title": "Senior Application Security",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6249498-senior-application-security",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/aptoslabs/jobs/4592269005",
        "title": "Software Engineer, Product",
        "company": "Aptos Labs",
        "link": "https://job-boards.greenhouse.io/aptoslabs/jobs/4592269005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7120985",
        "title": "Specialist Solutions Architect, Crypto & Stablecoins",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7120985",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7121678",
        "title": "Specialist Solutions Architect, Banking as a Service",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7121678",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7125626",
        "title": "Risk Partnerships Manager, Payment Networks",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7125626",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/88ac445b-635d-45d1-8ad7-1e4aadb6317a?utm_source=jobs.a16z.com",
        "title": "Payroll Specialist | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/88ac445b-635d-45d1-8ad7-1e4aadb6317a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7118945",
        "title": "Accounts Receivable Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7118945",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/529e32e5-d849-498f-b313-29b6cc99e593?lever-source%5B%5D=jobs.a16z.com",
        "title": "Account Executive - Named: FinTech",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/529e32e5-d849-498f-b313-29b6cc99e593?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7121581",
        "title": "Monetization Operation Analyst",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7121581",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/21f8b592-3242-4ec9-8549-63bccafd0744?utm_source=jobs.a16z.com",
        "title": "Senior Infrastructure Engineer",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/21f8b592-3242-4ec9-8549-63bccafd0744?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/f33685be-a046-43b1-90db-fb95653495a4?utm_source=jobs.a16z.com",
        "title": "Sales Development Representative, Mobility | North America",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/f33685be-a046-43b1-90db-fb95653495a4?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6249518-analista-de-fp-a-senior",
        "title": "Analista de FP&A - Sênior",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6249518-analista-de-fp-a-senior",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/32ff3681-d94e-4b03-90e4-8fc43343dd8f?utm_source=jobs.a16z.com",
        "title": "Account Executive, Expansion, SMB",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/32ff3681-d94e-4b03-90e4-8fc43343dd8f?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/OpenSea/d7331acd-347c-4c64-8858-6c092bed484b?utm_source=jobs.a16z.com",
        "title": "Staff Data Engineer",
        "company": "OpenSea",
        "link": "https://jobs.ashbyhq.com/OpenSea/d7331acd-347c-4c64-8858-6c092bed484b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9eb9e880-d800-4b13-bf8b-c4724be8b763?utm_source=jobs.a16z.com",
        "title": "Tech Lead, Software QA Excellence",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9eb9e880-d800-4b13-bf8b-c4724be8b763?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sardine/cd984805-70c2-4c77-b0ac-17fc53fa0427?utm_source=jobs.a16z.com",
        "title": "Senior Software Engineer - Data Platform",
        "company": "Sardine",
        "link": "https://jobs.ashbyhq.com/sardine/cd984805-70c2-4c77-b0ac-17fc53fa0427?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bb9b04fc-3472-49b9-9245-678ea2f710dc?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Netherlands",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bb9b04fc-3472-49b9-9245-678ea2f710dc?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/3b22b9d3-d177-4c93-9f6d-99d7e84b1ec5?utm_source=jobs.a16z.com",
        "title": "Senior Business Analyst, Lending",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/3b22b9d3-d177-4c93-9f6d-99d7e84b1ec5?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/0a3ab025-f39c-4d5f-90bd-78bf4b4f46a2?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Compliance, Information Technology",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/0a3ab025-f39c-4d5f-90bd-78bf4b4f46a2?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7120248",
        "title": "Manager, Account Executive - Enterprise Hunter (Central and East)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7120248",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6242454-executivo-de-contas-crm",
        "title": "Executivo de Contas | CRM",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6242454-executivo-de-contas-crm",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/b81ebc9a-9cc7-4c8d-9893-d940ae20df0a?utm_source=jobs.a16z.com",
        "title": "Payroll Associate | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/b81ebc9a-9cc7-4c8d-9893-d940ae20df0a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/wingspan/jobs/6668877003",
        "title": "Contractor Support Specialist",
        "company": "Wingspan",
        "link": "https://job-boards.greenhouse.io/wingspan/jobs/6668877003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/wingspan/jobs/6668878003",
        "title": "Contractor Support Specialist",
        "company": "Wingspan",
        "link": "https://job-boards.greenhouse.io/wingspan/jobs/6668878003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/ab6a16a7-8bcb-4b20-9dc3-6c1d93816380?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Portugal",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/ab6a16a7-8bcb-4b20-9dc3-6c1d93816380?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/081258fe-1322-4e2e-b217-ce8deedd1fc5?utm_source=jobs.a16z.com",
        "title": "Senior Embedded Software Engineer, OrbMini",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/081258fe-1322-4e2e-b217-ce8deedd1fc5?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://careers.kula.ai/flow-com/10708",
        "title": "Head of Product Marketing",
        "company": "Flow Blockchain",
        "link": "https://careers.kula.ai/flow-com/10708",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7030272",
        "title": "Risk Partner Manager, Issuing & Capital",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7030272",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/71bcf12e-3b02-4845-81c0-204bde58c938?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Marketing, Growth Operations",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/71bcf12e-3b02-4845-81c0-204bde58c938?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6249530-lead-analytics-engineer",
        "title": "Lead Analytics Engineer",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6249530-lead-analytics-engineer",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7117907",
        "title": "Data Scientist",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7117907",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/tryjeeves/220ad848-413c-4d2c-ab1a-776bcfcc8028?lever-source%5B%5D=jobs.a16z.com",
        "title": "Head of Marketing",
        "company": "Jeeves",
        "link": "https://jobs.lever.co/tryjeeves/220ad848-413c-4d2c-ab1a-776bcfcc8028?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7090524",
        "title": "People Strategy and Enablement Project Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7090524",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/55fdb6b9-2a68-470e-8c45-7b3b7e18548f?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Marketing, Growth",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/55fdb6b9-2a68-470e-8c45-7b3b7e18548f?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7113720",
        "title": "Product Marketing Copywriter",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7113720",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7116537",
        "title": "Partner Development Manager, Card Networks",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7116537",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://current.com/careers/open-positions/?id=7116300&gh_jid=7116300",
        "title": "Engineering Manager, iOS",
        "company": "Current",
        "link": "https://current.com/careers/open-positions/?id=7116300&gh_jid=7116300",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/73caaa27-1507-4dc1-a78a-e967945f58f3?lever-source%5B%5D=jobs.a16z.com",
        "title": "IT Manager",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/73caaa27-1507-4dc1-a78a-e967945f58f3?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/8599db9d-d6c7-431d-aaf9-59bd02c05deb?utm_source=jobs.a16z.com",
        "title": "Finance Operations Lead",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/8599db9d-d6c7-431d-aaf9-59bd02c05deb?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Solana%20Foundation/6a09defd-28a1-4a6f-9ff9-52c7d008e5e8?utm_source=jobs.a16z.com",
        "title": "Executive Assistant / Personal Assistant",
        "company": "Solana Foundation",
        "link": "https://jobs.ashbyhq.com/Solana%20Foundation/6a09defd-28a1-4a6f-9ff9-52c7d008e5e8?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/c8370c4d-34cb-422a-a4a3-566620270f25?utm_source=jobs.a16z.com",
        "title": "Talent Network",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/c8370c4d-34cb-422a-a4a3-566620270f25?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/withclutch/caf8c2a9-f49e-4f94-bdb8-5cd925781d20?utm_source=jobs.a16z.com",
        "title": "Senior Security Engineer II",
        "company": "Clutch",
        "link": "https://jobs.ashbyhq.com/withclutch/caf8c2a9-f49e-4f94-bdb8-5cd925781d20?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://recruiterflow.com/coinswitch/jobs/548",
        "title": "HR Operations",
        "company": "CoinSwitch Kuber",
        "link": "https://recruiterflow.com/coinswitch/jobs/548",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/2c6754c4-23dd-4a2a-811c-e615a4a88466?utm_source=jobs.a16z.com",
        "title": "Sales Development Representative, Deel IT | DACH",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/2c6754c4-23dd-4a2a-811c-e615a4a88466?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/provable/45f1dae1-d41d-4c07-9d70-f8dee17e4b84?utm_source=jobs.a16z.com",
        "title": "Product Manager",
        "company": "Provable",
        "link": "https://jobs.ashbyhq.com/provable/45f1dae1-d41d-4c07-9d70-f8dee17e4b84?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://careers.kula.ai/dapperlabs/10268",
        "title": "Lead Producer, Sports (LiveOps)",
        "company": "Dapper Labs",
        "link": "https://careers.kula.ai/dapperlabs/10268",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/7e71681c-0b6a-4d55-9a17-7757fbace4f9?lever-source%5B%5D=jobs.a16z.com",
        "title": "People Development Program Manager",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/7e71681c-0b6a-4d55-9a17-7757fbace4f9?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/3ebad86d-125a-4aa9-a5a8-1d71a804d659?lever-source%5B%5D=jobs.a16z.com",
        "title": "Accounting Manager",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/3ebad86d-125a-4aa9-a5a8-1d71a804d659?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/9dd147cf-03a0-4766-b230-ec8a7fe32262?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Technical Staff, Internal Systems",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/9dd147cf-03a0-4766-b230-ec8a7fe32262?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/flockhomes/jobs/4590486005",
        "title": "Revenue Operations Specialist",
        "company": "Flock Homes",
        "link": "https://job-boards.greenhouse.io/flockhomes/jobs/4590486005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6244234-analista-de-inadimplencia-junior",
        "title": "Analista de Inadimplência Junior",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6244234-analista-de-inadimplencia-junior",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7075323",
        "title": "Product Manager, Finance Systems",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7075323",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7091121",
        "title": "Technical Recruiter (Fixed Term Contract)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7091121",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7110218",
        "title": "Policy & Technical Accountant",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7110218",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/0f13c760-a28f-4750-8b6f-2b6d5e5b10cf?lever-source%5B%5D=jobs.a16z.com",
        "title": "Member of Trading Operations",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/0f13c760-a28f-4750-8b6f-2b6d5e5b10cf?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/715ee69a-3e40-44de-a74e-74a111536659?lever-source%5B%5D=jobs.a16z.com",
        "title": "Director, Product Marketing",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/715ee69a-3e40-44de-a74e-74a111536659?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7106869",
        "title": "Head of Machine Learning",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7106869",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7102805",
        "title": "Revenue Analytics Manager",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7102805",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7003361",
        "title": "Corporate Development M&A Integration team",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7003361",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7079621",
        "title": "Product Marketing Manager, Industries",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7079621",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7110035",
        "title": "Sales Development Representative, Greater China",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7110035",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/23e13df1-49dd-4c38-ba5a-ffba33638fad?utm_source=jobs.a16z.com",
        "title": "MarComm Manager, Thailand",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/23e13df1-49dd-4c38-ba5a-ffba33638fad?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/2683da47-2d3b-49b5-afa4-d8ecb2c76ddf?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/2683da47-2d3b-49b5-afa4-d8ecb2c76ddf?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/0efd5a8d-997e-4544-a7cc-6bc5ff91e3fd?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Denmark",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/0efd5a8d-997e-4544-a7cc-6bc5ff91e3fd?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/69b152c5-1db8-4466-8676-d8168324dd50?utm_source=jobs.a16z.com",
        "title": "Team Lead, Payroll Implementation | EMEA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/69b152c5-1db8-4466-8676-d8168324dd50?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/5b7e2bb5-bba3-40c4-bb44-5b2528f9dcc8?utm_source=jobs.a16z.com",
        "title": "Senior Software Engineer",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/5b7e2bb5-bba3-40c4-bb44-5b2528f9dcc8?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/733b85a8-5624-44b0-a392-00e0e1235a0b?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Slovakia",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/733b85a8-5624-44b0-a392-00e0e1235a0b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/ef4257ca-db1f-457c-8231-20c23be10435?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager| Poland",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/ef4257ca-db1f-457c-8231-20c23be10435?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7e379662-e76f-41ab-aea0-9e7a01a839fe?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Czech Republic",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7e379662-e76f-41ab-aea0-9e7a01a839fe?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7113608",
        "title": "Technical Solutions Engineer",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7113608",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7114694",
        "title": "Manager, Risk Operations Enablement",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7114694",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/flockhomes/jobs/4589912005",
        "title": "Exchange Manager",
        "company": "Flock Homes",
        "link": "https://job-boards.greenhouse.io/flockhomes/jobs/4589912005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7106660",
        "title": "Sales Development Representative (French-speaking)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7106660",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://current.com/careers/open-positions/?id=7096727&gh_jid=7096727",
        "title": "Director of Risk (Bank Fraud)",
        "company": "Current",
        "link": "https://current.com/careers/open-positions/?id=7096727&gh_jid=7096727",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://point.com/hiring?gh_jid=8092962002",
        "title": "Lead Recruiter/Manager",
        "company": "Point",
        "link": "https://point.com/hiring?gh_jid=8092962002",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/d039fcca-8d00-4590-bf25-60a53c9c12cd?utm_source=jobs.a16z.com",
        "title": "Payroll Associate | Germany",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/d039fcca-8d00-4590-bf25-60a53c9c12cd?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bf8ed7c7-05f4-4a8a-83e8-e3dfdd899e30?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Italy",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bf8ed7c7-05f4-4a8a-83e8-e3dfdd899e30?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7108022",
        "title": "Senior Software Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7108022",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/paveakatroveinformationtechnologies/jobs/4579871005",
        "title": "Commercial Account Manager",
        "company": "Pave",
        "link": "https://job-boards.greenhouse.io/paveakatroveinformationtechnologies/jobs/4579871005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7103907",
        "title": "Senior IT Support Specialist",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7103907",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7099421",
        "title": "Solutions Architect, Enterprise",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7099421",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7093503",
        "title": "Staff Brand Designer, Tertiary Brands",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7093503",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/517afd96-bd51-45ab-84df-0bdad310576b?lever-source%5B%5D=jobs.a16z.com",
        "title": "Staff Engineer, Production Operations",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/517afd96-bd51-45ab-84df-0bdad310576b?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/a28047d9-ec2f-4815-8082-34c4de7f0b45?utm_source=jobs.a16z.com",
        "title": "Team Lead, Payroll Operations | Benelux",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/a28047d9-ec2f-4815-8082-34c4de7f0b45?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/08d23faa-669c-479a-ab67-7089480a9c6c?utm_source=jobs.a16z.com",
        "title": "Payroll Associate | Canada",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/08d23faa-669c-479a-ab67-7089480a9c6c?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/22e7cfa5-4c55-4daf-ba39-a8cf43e6d5b2?lever-source%5B%5D=jobs.a16z.com",
        "title": "Engineering Manager - Customer Foundations",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/22e7cfa5-4c55-4daf-ba39-a8cf43e6d5b2?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/6ed5f933-71db-4271-9937-745dd1eddfb1?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Germany",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/6ed5f933-71db-4271-9937-745dd1eddfb1?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://payall.bamboohr.com/careers/32",
        "title": "Project/Implementation Manager",
        "company": "Payall Payment Systems",
        "link": "https://payall.bamboohr.com/careers/32",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/35373ab2-3b8d-44f7-a2b2-c33d29b2d4f0?utm_source=jobs.a16z.com",
        "title": "Account Executive, SMB | LATAM",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/35373ab2-3b8d-44f7-a2b2-c33d29b2d4f0?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9e9cd6bf-b54f-4906-8cf2-653848acb8ed?utm_source=jobs.a16z.com",
        "title": "Manager, Sales Development, SMB | DACH",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9e9cd6bf-b54f-4906-8cf2-653848acb8ed?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/c03b212d-e88a-4bf3-a52d-96a6e27408d9?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (Middle East)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/c03b212d-e88a-4bf3-a52d-96a6e27408d9?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/c74e8700-31d7-456c-a9fa-0144cfc3287b?lever-source%5B%5D=jobs.a16z.com",
        "title": "QA Automation",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/c74e8700-31d7-456c-a9fa-0144cfc3287b?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7099732",
        "title": "Account Executive, Platforms, Hunter (US, CA)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7099732",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9c198172-e6de-4dce-a046-cc1c6e818a40?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Germany",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9c198172-e6de-4dce-a046-cc1c6e818a40?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7ec00a61-c6d7-4360-971c-5d992e5a7c80?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Associate | South Korea",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7ec00a61-c6d7-4360-971c-5d992e5a7c80?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/74887927-2d01-4101-9cd3-1fabe09e2361?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | South Korea",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/74887927-2d01-4101-9cd3-1fabe09e2361?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://point.com/hiring?gh_jid=8080976002",
        "title": "Post Closing Servicing Specialist (Contract)",
        "company": "Point",
        "link": "https://point.com/hiring?gh_jid=8080976002",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7103871",
        "title": "Design Recruiter (Fixed Term Contract)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7103871",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7080962",
        "title": "Staff Product Manager, Crypto",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7080962",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6659556003",
        "title": "Payroll Associate",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6659556003",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7100847",
        "title": "Account Executive, Platforms - Hunter",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7100847",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7062837",
        "title": "People Analytics Analyst",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7062837",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/c78b0ebb-e51c-4c87-845b-6bb7585ec1d0?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Associate | Spain",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/c78b0ebb-e51c-4c87-845b-6bb7585ec1d0?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/8abeedc9-5a0f-457c-976a-31ec59b04249?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | China",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/8abeedc9-5a0f-457c-976a-31ec59b04249?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/6ed7723b-58fe-4b66-b711-0932b5e7dd44?utm_source=jobs.a16z.com",
        "title": "Tax Operations Specialist | Canada",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/6ed7723b-58fe-4b66-b711-0932b5e7dd44?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/fd63447e-db97-4f53-be56-e30d02974a2a?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Associate, Australian Payroll",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/fd63447e-db97-4f53-be56-e30d02974a2a?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/cc0ba4a8-75a5-4a4e-aeb8-daaf7423489b?utm_source=jobs.a16z.com",
        "title": "Payroll Associate | China",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/cc0ba4a8-75a5-4a4e-aeb8-daaf7423489b?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Sui%20Foundation/4d55ade7-26d7-4f1e-9337-b4324720f583?utm_source=jobs.a16z.com",
        "title": "IT Systems Engineer - Athens",
        "company": "Sui Foundation",
        "link": "https://jobs.ashbyhq.com/Sui%20Foundation/4d55ade7-26d7-4f1e-9337-b4324720f583?utm_source=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7079946",
        "title": "Integration Engineer (SEA & GCN)",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7079946",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6228122-analista-de-planejamento-senior",
        "title": "Analista de Planejamento Senior",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6228122-analista-de-planejamento-senior",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4514382005",
        "title": "Senior Data Engineer",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4514382005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4204502005",
        "title": "Senior Front-end Software Engineer (React Native)",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4204502005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/10",
        "title": "Content & Special Projects Lead",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/10",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4360162005",
        "title": "Product Manager",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4360162005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4292324005",
        "title": "Midlevel Software Engineer",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4292324005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7091859",
        "title": "Product Manager, Link - Local Payment Methods",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7091859",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/f020139a-8259-49d1-8844-c766469f00e4?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Manager, Growth Marketing",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/f020139a-8259-49d1-8844-c766469f00e4?lever-source%5B%5D=jobs.a16z.com",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5596786004",
        "title": "HR Generalist",
        "company": "LayerZero Labs",
        "link": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5596786004",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7093414",
        "title": "Machine Learning Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7093414",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4204472005",
        "title": "Backend Senior Software Engineer",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4204472005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7061518",
        "title": "Engineering Manager, Compliance Observability",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7061518",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://stripe.com/jobs/search?gh_jid=7099651",
        "title": "Account Executive, Enterprise",
        "company": "Stripe",
        "link": "https://stripe.com/jobs/search?gh_jid=7099651",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4383485005",
        "title": "Customer Experience Analyst",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4383485005",
        "date": "2024-08-15T12:00:00Z",
        "source": "Manual"
    }
];

const FEEDS = [
  'https://politepol.com/fd/JEeZwG4KK7uT.xml', // Dragonfly
  'https://politepol.com/fd/sDzglCq7RCpG.xml', // Paradigm
  'https://politepol.com/fd/bs9i34afSjHS.xml', // Arbitrum
  'https://politepol.com/fd/oiXKHETnrDap.xml', // a16z
  'https://politepol.com/fd/Ane01VX84MOk.xml', // Pantera
  'https://politepol.com/fd/HI6pMDlyEO7j.xml'  // Avalanche
];

const parser = new Parser();

// Helper to clean company names
function cleanCompany(company: string | undefined): string | undefined {
    if (!company) return undefined;
    return company.replace(/<[^>]*>?/gm, '').split('\n')[0].trim();
}

// Helper to remove emojis
function removeEmojis(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').trim();
}


export async function getJobs(): Promise<Job[]> {
  const allJobsPromises = FEEDS.map(async (feedUrl) => {
    try {
      const feed = await parser.parseURL(feedUrl);
      if (feed?.items) {
        return feed.items.map((item) => {
          const title = removeEmojis(item.title?.trim());
          const company = cleanCompany(item.content);
          const link = item.link;

          if (link && title && company && title.split(' ').length <= 8 && !title.toLowerCase().includes('bounty')) {
            return {
              id: item.guid || link,
              title,
              company,
              link,
              date: item.isoDate || new Date().toISOString(),
              source: feed.title || feedUrl,
            };
          }
          return null;
        }).filter((job): job is Job => job !== null);
      }
      return [];
    } catch (error) {
      console.warn(`Could not fetch or parse feed: ${feedUrl}`, error);
      return [];
    }
  });

  const newJobsNested = await Promise.all(allJobsPromises);
  const fetchedJobs = newJobsNested.flat();
  
  // Combine manually added jobs with fetched jobs
  const allJobs = [...MANUAL_JOBS, ...fetchedJobs];

  const jobMap = new Map<string, Job>();
  allJobs.forEach(job => {
      const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `${normalize(job.title)}-${normalize(job.company)}`;
      const existingJob = jobMap.get(key);

      if (!existingJob || new Date(job.date) > new Date(existingJob.date)) {
          jobMap.set(key, job);
      }
  });
  
  let uniqueJobs = Array.from(jobMap.values());

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  uniqueJobs = uniqueJobs.filter(job => new Date(job.date) >= ninetyDaysAgo);

  uniqueJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return uniqueJobs;
}
