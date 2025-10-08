'use server';

import Parser from 'rss-parser';
import type { Job } from '@/types';

// The jobs you manually added are now stored here permanently.
const MANUAL_JOBS: Job[] = [
    {
        "id": "https://job-boards.greenhouse.io/alchemy/jobs/4599359005",
        "title": "Site Reliability Engineer",
        "company": "Alchemy",
        "link": "https://job-boards.greenhouse.io/alchemy/jobs/4599359005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5628728004",
        "title": "Partner Marketer",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5628728004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/2b9a141e-0669-4197-aa52-2b07d9fadc96?lever-source%5B%5D=jobs.a16z.com",
        "title": "Software Engineer - Platform",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/2b9a141e-0669-4197-aa52-2b07d9fadc96?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7182039",
        "title": "Senior Mobile Engineer (Android)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7182039",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/eigen-labs/4e018bca-ec96-43f7-a3f6-b784bbd19a7f?utm_source=jobs.a16z.com",
        "title": "Staff Software Engineer, Fullstack",
        "company": "EigenLayer",
        "link": "https://jobs.ashbyhq.com/eigen-labs/4e018bca-ec96-43f7-a3f6-b784bbd19a7f?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6688696003",
        "title": "Senior Analytics Engineer II",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6688696003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/mystenlabs/7faf0127-1e2d-4a2e-808c-24868daa9a3a?utm_source=jobs.a16z.com",
        "title": "Senior Communications Manager, Walrus",
        "company": "Mysten Labs",
        "link": "https://jobs.ashbyhq.com/mystenlabs/7faf0127-1e2d-4a2e-808c-24868daa9a3a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/9006a802-8d9c-43a3-b566-dca55ce73819?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Revenue Accountant",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/9006a802-8d9c-43a3-b566-dca55ce73819?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/spade/jobs/4598919005",
        "title": "Head of Engineering",
        "company": "Spade",
        "link": "https://job-boards.greenhouse.io/spade/jobs/4598919005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7e02daad-59d2-49f3-afa3-b9b568e4edc5?utm_source=jobs.a16z.com",
        "title": "Payroll Associate, Africa Payroll | India",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7e02daad-59d2-49f3-afa3-b9b568e4edc5?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/285cbc02-bf6c-4f9e-903c-85fb5a9e9c10?utm_source=jobs.a16z.com",
        "title": "Senior Manager of Accounting Operations",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/285cbc02-bf6c-4f9e-903c-85fb5a9e9c10?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/method/de13a369-ccb9-4b03-9a28-a8e551ee3949?utm_source=jobs.a16z.com",
        "title": "Senior Software Engineer",
        "company": "Method",
        "link": "https://jobs.ashbyhq.com/method/de13a369-ccb9-4b03-9a28-a8e551ee3949?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/lightspark/e207e505-6b0c-4f1f-ae97-6e75dbd9fbeb?utm_source=jobs.a16z.com",
        "title": "Senior Staff Engineer, Spark",
        "company": "Lightspark",
        "link": "https://jobs.ashbyhq.com/lightspark/e207e505-6b0c-4f1f-ae97-6e75dbd9fbeb?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4589818006",
        "title": "Director, Product Management (Consumer)",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4589818006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Solana%20Foundation/32de1a78-2e7d-469d-b846-c61152324365?utm_source=jobs.a16z.com",
        "title": "Growth Lead- Japan",
        "company": "Solana Foundation",
        "link": "https://jobs.ashbyhq.com/Solana%20Foundation/32de1a78-2e7d-469d-b846-c61152324365?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Sui%20Foundation/833f7999-f042-43d3-b2b4-e8064bee8cd7?utm_source=jobs.a16z.com",
        "title": "Partner Marketing Coordinator - Walrus (Contract)",
        "company": "Sui Foundation",
        "link": "https://jobs.ashbyhq.com/Sui%20Foundation/833f7999-f042-43d3-b2b4-e8064bee8cd7?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/e62916c2-71d8-4c04-a3a5-1331700e4e46?utm_source=jobs.a16z.com",
        "title": "Enterprise Sales Lead, Payments",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/e62916c2-71d8-4c04-a3a5-1331700e4e46?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/walrus/21e0f179-40c8-4d6a-b241-97cbcdb5e3d6?utm_source=jobs.a16z.com",
        "title": "Chief of Staff",
        "company": "Walrus Foundation",
        "link": "https://jobs.ashbyhq.com/walrus/21e0f179-40c8-4d6a-b241-97cbcdb5e3d6?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/0e9c8c3f-ae73-43e7-b882-1a42af518973?utm_source=jobs.a16z.com",
        "title": "Strategic Account Executive, Financial Services",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/0e9c8c3f-ae73-43e7-b882-1a42af518973?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/4386e2ac-bcb7-496c-9108-502ce29dabd8?utm_source=jobs.a16z.com",
        "title": "Events & Community Lead",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/4386e2ac-bcb7-496c-9108-502ce29dabd8?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/eaa0267b-d44c-4168-8977-8a0ec585b599?lever-source%5B%5D=jobs.a16z.com",
        "title": "Key Account Manager (Qatar)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/eaa0267b-d44c-4168-8977-8a0ec585b599?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6688184003",
        "title": "Workday LMS Consultant",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6688184003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Runway/c17a5f0b-ce37-4544-9107-cea79ac39d44?utm_source=jobs.a16z.com",
        "title": "FP&A Experience Manager",
        "company": "Runway",
        "link": "https://jobs.ashbyhq.com/Runway/c17a5f0b-ce37-4544-9107-cea79ac39d44?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/d767361b-4d3b-47ee-b16b-31011195b93c?utm_source=jobs.a16z.com",
        "title": "Lead Product Designer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/d767361b-4d3b-47ee-b16b-31011195b93c?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://branchinternational.applytojob.com/apply/E5RGe7p13E/Software-Engineer-DevOps-Security",
        "title": "Software Engineer - DevOps Security",
        "company": "Branch International",
        "link": "https://branchinternational.applytojob.com/apply/E5RGe7p13E/Software-Engineer-DevOps-Security",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/withclutch/0c3c4ec5-8dea-4d36-a560-9024e3961389?utm_source=jobs.a16z.com",
        "title": "Engagement Manager",
        "company": "Clutch",
        "link": "https://jobs.ashbyhq.com/withclutch/0c3c4ec5-8dea-4d36-a560-9024e3961389?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/phantom/b7d0a7f7-c1d0-43c3-936f-c97ff46ee72e?utm_source=jobs.a16z.com",
        "title": "Backend Engineer, Blockchain Data Team",
        "company": "Phantom",
        "link": "https://jobs.ashbyhq.com/phantom/b7d0a7f7-c1d0-43c3-936f-c97ff46ee72e?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5628475004",
        "title": "Sales Development - Lead",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5628475004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/9d15c09f-d352-4c9d-aeb5-408b883cc2e8?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Engineer - Enterprise",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/9d15c09f-d352-4c9d-aeb5-408b883cc2e8?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5625060004",
        "title": "Senior Program Manager - Financial Crimes",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5625060004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7178297",
        "title": "Senior Software Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7178297",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7178471",
        "title": "Staff Machine Learning Platform Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7178471",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/eed2fec0-67fe-4a1d-a237-3b9b5bf9f114?lever-source%5B%5D=jobs.a16z.com",
        "title": "Product Marketing Manager - Industry",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/eed2fec0-67fe-4a1d-a237-3b9b5bf9f114?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5624250004",
        "title": "Senior Account Executive - eCommerce",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5624250004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7176669",
        "title": "Staff Software Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7176669",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6685766003",
        "title": "Senior Analytics Engineer I",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6685766003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c9f77c25-f4c9-45d2-9c9b-4dc258279f23?utm_source=jobs.a16z.com",
        "title": "Senior Finance Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c9f77c25-f4c9-45d2-9c9b-4dc258279f23?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5620024004",
        "title": "Customer Support Specialist - Weekend Coverage",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5620024004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/2adcbb66-7180-40d5-a3de-a4ef2ce8ab70?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Associate, Australia Payroll | India",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/2adcbb66-7180-40d5-a3de-a4ef2ce8ab70?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/alchemy/jobs/4600392005",
        "title": "Enterprise Account Executive",
        "company": "Alchemy",
        "link": "https://job-boards.greenhouse.io/alchemy/jobs/4600392005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7176250",
        "title": "Senior Growth Marketing Manager, Offline",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7176250",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7182037",
        "title": "Senior Software Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7182037",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/70cf1163-b70c-492e-9228-b44d264a7c30?utm_source=jobs.a16z.com",
        "title": "Manager, Sales Development | North Asia",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/70cf1163-b70c-492e-9228-b44d264a7c30?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/776333d3-864d-42db-9ea4-49381143160a?utm_source=jobs.a16z.com",
        "title": "Warehouse AssociateIT equipment | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/776333d3-864d-42db-9ea4-49381143160a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Sui%20Foundation/c4c3a084-3073-4127-ac26-2885162ad5e9?utm_source=jobs.a16z.com",
        "title": "Partner Marketing Manager - Walrus",
        "company": "Sui Foundation",
        "link": "https://jobs.ashbyhq.com/Sui%20Foundation/c4c3a084-3073-4127-ac26-2885162ad5e9?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/03ca0083-d2d6-4992-b970-8f42433a097e?utm_source=jobs.a16z.com",
        "title": "Shipping Assistant, IT Equipment | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/03ca0083-d2d6-4992-b970-8f42433a097e?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7c8cd628-e335-468d-b302-8b5ca0d6b646?utm_source=jobs.a16z.com",
        "title": "Account Executive, Global Payroll, SMB",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7c8cd628-e335-468d-b302-8b5ca0d6b646?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/416414c5-7c63-4e42-8885-3c29d8be120d?utm_source=jobs.a16z.com",
        "title": "Associate Director, Sales Operations | Americas",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/416414c5-7c63-4e42-8885-3c29d8be120d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Solana%20Foundation/a3bf1757-a7dc-49be-b77e-04b790477ecb?utm_source=jobs.a16z.com",
        "title": "Growth Lead- Greater China",
        "company": "Solana Foundation",
        "link": "https://jobs.ashbyhq.com/Solana%20Foundation/a3bf1757-a7dc-49be-b77e-04b790477ecb?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/da1ecf01-7421-42d6-8c2d-28dd73bc8976?utm_source=jobs.a16z.com",
        "title": "Senior Partner Marketing Manager | Campaigns",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/da1ecf01-7421-42d6-8c2d-28dd73bc8976?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Sui%20Foundation/10589133-2489-4f66-9e3a-d4a24f166bfc?utm_source=jobs.a16z.com",
        "title": "Social Media Marketing Manager - Walrus",
        "company": "Sui Foundation",
        "link": "https://jobs.ashbyhq.com/Sui%20Foundation/10589133-2489-4f66-9e3a-d4a24f166bfc?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/67f84e2f-f07d-4125-a741-bcd3eaedefa2?utm_source=jobs.a16z.com",
        "title": "Global Supply Chain Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/67f84e2f-f07d-4125-a741-bcd3eaedefa2?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/701be0a4-7b79-4f0f-a9f6-fe10bca48949?utm_source=jobs.a16z.com",
        "title": "Senior Partner Marketing Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/701be0a4-7b79-4f0f-a9f6-fe10bca48949?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/ac39d5bf-b7b2-4186-a84c-02eff562e5dd?utm_source=jobs.a16z.com",
        "title": "Enterprise Sales Lead, Institutions",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/ac39d5bf-b7b2-4186-a84c-02eff562e5dd?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/6c855bd4-2cd3-4946-8a25-57a163a022fb?utm_source=jobs.a16z.com",
        "title": "Staff Product Manager - Treasury",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/6c855bd4-2cd3-4946-8a25-57a163a022fb?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/a12df33b-5685-41ac-a6a6-59723d9fcce5?utm_source=jobs.a16z.com",
        "title": "Fulfilment Centre Associate, IT equipment | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/a12df33b-5685-41ac-a6a6-59723d9fcce5?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/c84d85db-4638-43c9-a814-afbf3c397412?utm_source=jobs.a16z.com",
        "title": "Staff Engineer (AI/ML Systems)",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/c84d85db-4638-43c9-a814-afbf3c397412?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/0cc843ae-4233-4448-b097-0126070b58cb?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Expert | USA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/0cc843ae-4233-4448-b097-0126070b58cb?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/62192257-41ad-43b6-855d-9187113e05bb?utm_source=jobs.a16z.com",
        "title": "Order Operations Associate, IT equipment shipping | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/62192257-41ad-43b6-855d-9187113e05bb?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/f12e4f49-23d1-48b6-836d-3d7da7e38291?utm_source=jobs.a16z.com",
        "title": "Product Manager, Payments",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/f12e4f49-23d1-48b6-836d-3d7da7e38291?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/8c67d644-c38c-4e4d-98d1-524e79452697?utm_source=jobs.a16z.com",
        "title": "Enterprise Sales Lead, CeX",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/8c67d644-c38c-4e4d-98d1-524e79452697?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/lightspark/a97c84ff-80f0-4006-8bc8-a4a21139c382?utm_source=jobs.a16z.com",
        "title": "Staff Backend Engineer, Spark",
        "company": "Lightspark",
        "link": "https://jobs.ashbyhq.com/lightspark/a97c84ff-80f0-4006-8bc8-a4a21139c382?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/fad0bc38-3f55-4bfb-ab95-4815acc5f376?lever-source%5B%5D=jobs.a16z.com",
        "title": "Revenue Accounting Manager",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/fad0bc38-3f55-4bfb-ab95-4815acc5f376?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/lightspark/c143bf7f-dd98-4a2f-8fb5-9d7e437353f4?utm_source=jobs.a16z.com",
        "title": "Senior Production Engineer",
        "company": "Lightspark",
        "link": "https://jobs.ashbyhq.com/lightspark/c143bf7f-dd98-4a2f-8fb5-9d7e437353f4?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6688699003",
        "title": "Senior Analytics Engineer II",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6688699003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/38b12877-0c3f-4b7a-adec-85cf3419dbfc?utm_source=jobs.a16z.com",
        "title": "Senior Technical Writer, Integrations",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/38b12877-0c3f-4b7a-adec-85cf3419dbfc?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/4ccfab89-f11b-4e80-b109-6ab8cd495a53?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Associate | India",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/4ccfab89-f11b-4e80-b109-6ab8cd495a53?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1cde6b24-a110-4b1e-b7a1-0e3cdf489d21?utm_source=jobs.a16z.com",
        "title": "Senior Manager, Payroll (EMEA/APAC)",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1cde6b24-a110-4b1e-b7a1-0e3cdf489d21?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/fd7f12d2-8e57-4c97-8f85-603d57d8243c?utm_source=jobs.a16z.com",
        "title": "Immigration Consultant",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/fd7f12d2-8e57-4c97-8f85-603d57d8243c?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/605d7020-9b04-41e7-b974-ffe3b6989053?utm_source=jobs.a16z.com",
        "title": "Senior Software Engineer, ML Platform & Ops",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/605d7020-9b04-41e7-b974-ffe3b6989053?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/5c88bf0b-b4c5-4f11-bd64-47eb13aec204?utm_source=jobs.a16z.com",
        "title": "Senior Product Operations Manager, FinCrime",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/5c88bf0b-b4c5-4f11-bd64-47eb13aec204?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/52d69e00-0bd7-4e0f-a6bd-fae8044e5415?utm_source=jobs.a16z.com",
        "title": "Immigration Consultant",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/52d69e00-0bd7-4e0f-a6bd-fae8044e5415?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/a1491b80-f0c2-4968-80f2-419edc9f869d?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager, Melis",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/a1491b80-f0c2-4968-80f2-419edc9f869d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9aa56d22-b3e5-491b-9b93-7815f9b82350?utm_source=jobs.a16z.com",
        "title": "Senior Product Partnerships Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9aa56d22-b3e5-491b-9b93-7815f9b82350?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bfdce105-98d0-4c62-b41b-8e05e5d48d27?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Netherlands",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bfdce105-98d0-4c62-b41b-8e05e5d48d27?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/de7fb381-026b-420a-8366-f04dffd64f61?utm_source=jobs.a16z.com",
        "title": "AI Product Engineer",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/de7fb381-026b-420a-8366-f04dffd64f61?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/552372cb-97b0-4e7b-92c5-16f52186466e?utm_source=jobs.a16z.com",
        "title": "Payroll Associate | Germany",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/552372cb-97b0-4e7b-92c5-16f52186466e?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9d9083fc-3bcd-47c3-a122-a6dbc85d23f6?utm_source=jobs.a16z.com",
        "title": "Data Privacy Compliance Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9d9083fc-3bcd-47c3-a122-a6dbc85d23f6?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/442c861b-63bf-47cd-8815-20cb9fc0ddbb?utm_source=jobs.a16z.com",
        "title": "SecOps Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/442c861b-63bf-47cd-8815-20cb9fc0ddbb?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/e2e34c82-5920-4291-aeb2-b6aa91c039fa?utm_source=jobs.a16z.com",
        "title": "Senior Manager, Payroll, EMEA/APAC",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/e2e34c82-5920-4291-aeb2-b6aa91c039fa?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/76f3a906-81f2-4d4c-99ce-e1a97c1ac5a6?utm_source=jobs.a16z.com",
        "title": "Back End Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/76f3a906-81f2-4d4c-99ce-e1a97c1ac5a6?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/01642d10-5573-4eac-bb36-4f2bbe91874b?utm_source=jobs.a16z.com",
        "title": "Senior Product Manager - EOR",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/01642d10-5573-4eac-bb36-4f2bbe91874b?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/838569fc-b2c7-4b03-936a-76ac608b696e?utm_source=jobs.a16z.com",
        "title": "Immigration Consultant",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/838569fc-b2c7-4b03-936a-76ac608b696e?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4592549006",
        "title": "Information Security Analyst",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4592549006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1c85e4c7-b6b9-444c-b922-4335a468a09c?utm_source=jobs.a16z.com",
        "title": "Customer Success Manager I | French Speaking",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1c85e4c7-b6b9-444c-b922-4335a468a09c?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7173211",
        "title": "Senior Mobile Engineer (Android)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7173211",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6688690003",
        "title": "Senior Analytics Engineer I",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6688690003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bb349fda-7b81-48c2-aabe-c1990999d648?utm_source=jobs.a16z.com",
        "title": "Front-End Engineer | LATAM",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bb349fda-7b81-48c2-aabe-c1990999d648?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/6a443ccf-4133-4ba0-aa1a-521f0701e338?utm_source=jobs.a16z.com",
        "title": "Senior Android Application Software Engineer, OrbMini",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/6a443ccf-4133-4ba0-aa1a-521f0701e338?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/8d8328c3-b02d-44df-a29b-ddce85c1ca0d?utm_source=jobs.a16z.com",
        "title": "Cloud Security Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/8d8328c3-b02d-44df-a29b-ddce85c1ca0d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/withclutch/edf02fbf-b06c-413b-87b4-75a0e16c733c?utm_source=jobs.a16z.com",
        "title": "Senior Product Manager, Platform/Identity",
        "company": "Clutch",
        "link": "https://jobs.ashbyhq.com/withclutch/edf02fbf-b06c-413b-87b4-75a0e16c733c?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/withclutch/c469a9bc-b3a8-4617-9acb-f431a90b6e01?utm_source=jobs.a16z.com",
        "title": "Senior Product Manager, Platform/Identity",
        "company": "Clutch",
        "link": "https://jobs.ashbyhq.com/withclutch/c469a9bc-b3a8-4617-9acb-f431a90b6e01?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/864d4c75-7df2-4826-9f96-add51fe9c60d?utm_source=jobs.a16z.com",
        "title": "Application (Web2) Security Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/864d4c75-7df2-4826-9f96-add51fe9c60d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/skymavis/4b58a7cf-538a-44c7-908b-da8918348efb?utm_source=jobs.a16z.com",
        "title": "Web3 Security Engineer",
        "company": "Sky Mavis",
        "link": "https://jobs.ashbyhq.com/skymavis/4b58a7cf-538a-44c7-908b-da8918348efb?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7007897d-6365-4e19-b8cf-146a7499b0e1?utm_source=jobs.a16z.com",
        "title": "Product Data Analyst",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7007897d-6365-4e19-b8cf-146a7499b0e1?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/629fc064-9e87-4f10-b259-40207b23c521?utm_source=jobs.a16z.com",
        "title": "Executive Assistant Associate",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/629fc064-9e87-4f10-b259-40207b23c521?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bd2aa71d-41e9-491e-8ec3-75450e211ffa?utm_source=jobs.a16z.com",
        "title": "Sales Development Representative, Mid-Market | DACH",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bd2aa71d-41e9-491e-8ec3-75450e211ffa?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/f264689a-265d-4c67-867f-9ecdf63204ee?utm_source=jobs.a16z.com",
        "title": "Senior Director, Product Design",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/f264689a-265d-4c67-867f-9ecdf63204ee?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/ac8b6368-b85a-48ff-8e3a-0eac769eb0ff?utm_source=jobs.a16z.com",
        "title": "Strategic Partner Lead, Infrastructure",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/ac8b6368-b85a-48ff-8e3a-0eac769eb0ff?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9c739dfc-ca83-4627-87b7-a8704814d844?utm_source=jobs.a16z.com",
        "title": "Account Executive, Global Mobility - APAC - Mandarin Speaker",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9c739dfc-ca83-4627-87b7-a8704814d844?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/8c6e1b32-ca9c-4519-bca9-e348876ebdc5?utm_source=jobs.a16z.com",
        "title": "Customer Support Country Specialist, Payroll",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/8c6e1b32-ca9c-4519-bca9-e348876ebdc5?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/4f39d716-9fc1-47ae-95c2-6cdd80f4d86d?utm_source=jobs.a16z.com",
        "title": "Payroll Expert Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/4f39d716-9fc1-47ae-95c2-6cdd80f4d86d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/3210ce48-0c7a-43f3-9aeb-77dd1f675100?utm_source=jobs.a16z.com",
        "title": "Senior Data Analyst - Marketing",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/3210ce48-0c7a-43f3-9aeb-77dd1f675100?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6306337-operador-de-cobranca-exclusiva-para-pcd-s",
        "title": "Operador de Cobrança (Exclusiva para PCD's)",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6306337-operador-de-cobranca-exclusiva-para-pcd-s",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/anchorage/56aedded-c959-4488-b265-5cc42a182dca?lever-source%5B%5D=jobs.a16z.com",
        "title": "Communications Manager",
        "company": "Anchorage",
        "link": "https://jobs.lever.co/anchorage/56aedded-c959-4488-b265-5cc42a182dca?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5616373004",
        "title": "Senior Model Risk Manager",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5616373004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5616371004",
        "title": "Senior Backend Engineer - Accounting",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5616371004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://current.com/careers/open-positions/?id=7155604&gh_jid=7155604",
        "title": "Senior Analytics Engineer",
        "company": "Current",
        "link": "https://current.com/careers/open-positions/?id=7155604&gh_jid=7155604",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6673539003",
        "title": "Deal Desk Analyst",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6673539003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/7fee353e-9353-4cf8-8d81-bab6a1feb307?utm_source=jobs.a16z.com",
        "title": "Threat Intelligence Researcher",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/7fee353e-9353-4cf8-8d81-bab6a1feb307?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Lido.fi/74b1a7bb-c906-4876-85a1-a191bc7be70a?utm_source=jobs.a16z.com",
        "title": "Institutional Growth Lead - USA",
        "company": "Lido",
        "link": "https://jobs.ashbyhq.com/Lido.fi/74b1a7bb-c906-4876-85a1-a191bc7be70a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/85f8c4f7-6125-4d44-8c44-2367a46cc5e2?utm_source=jobs.a16z.com",
        "title": "World Space Senior Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/85f8c4f7-6125-4d44-8c44-2367a46cc5e2?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/78e372c5-6966-4288-a574-5f672b3fb194?utm_source=jobs.a16z.com",
        "title": "Fulfilment Operations Associate | Houston, Texas, On-site",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/78e372c5-6966-4288-a574-5f672b3fb194?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1556c438-7038-43f9-9157-add4fc41b5af?utm_source=jobs.a16z.com",
        "title": "Back-End Engineer - Infrastructure Team",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1556c438-7038-43f9-9157-add4fc41b5af?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Lido.fi/0f1d028b-d6b3-48ed-8a1c-fa676e1ca6c8?utm_source=jobs.a16z.com",
        "title": "Compliance Lead",
        "company": "Lido",
        "link": "https://jobs.ashbyhq.com/Lido.fi/0f1d028b-d6b3-48ed-8a1c-fa676e1ca6c8?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Runway/0230526b-98a5-4786-8f00-ab472f33a191?utm_source=jobs.a16z.com",
        "title": "Controller",
        "company": "Runway",
        "link": "https://jobs.ashbyhq.com/Runway/0230526b-98a5-4786-8f00-ab472f33a191?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1518c47d-90db-48ee-9933-bc57e5ce97d8?utm_source=jobs.a16z.com",
        "title": "Manager, Customer Success, SMB",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1518c47d-90db-48ee-9933-bc57e5ce97d8?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/4210ab0f-d495-4157-9679-944d65db9917?utm_source=jobs.a16z.com",
        "title": "Account Executive, Mid-Market | North America",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/4210ab0f-d495-4157-9679-944d65db9917?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4590749006",
        "title": "Manager of Funding/CLosing",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4590749006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5615358004",
        "title": "Manager, Internal Audit",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5615358004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6675178003",
        "title": "VP, Business Risk Unit",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6675178003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6675219003",
        "title": "VP, Privacy Compliance",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6675219003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/1e5eec65-94f7-4d0a-9269-857f35503850?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Database Administrator",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/1e5eec65-94f7-4d0a-9269-857f35503850?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://current.com/careers/open-positions/?id=7144761&gh_jid=7144761",
        "title": "Senior Software Engineer, Infrastructure",
        "company": "Current",
        "link": "https://current.com/careers/open-positions/?id=7144761&gh_jid=7144761",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6296482-analista-de-experiencia",
        "title": "Analista de Experiência",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6296482-analista-de-experiencia",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/avalabs/jobs/5611660004",
        "title": "Mergers & Acquisitions Lead",
        "company": "Ava Labs",
        "link": "https://job-boards.greenhouse.io/avalabs/jobs/5611660004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7141990",
        "title": "Staff Product Manager",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7141990",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/wingspan/jobs/6674467003",
        "title": "Sales Development Representative",
        "company": "Wingspan",
        "link": "https://job-boards.greenhouse.io/wingspan/jobs/6674467003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6672873003",
        "title": "Associate, CRE Portfolio Management",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6672873003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7140915",
        "title": "Director, Customer Care Product Operations",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7140915",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6673615003",
        "title": "Analyst, AML/CFT & OFAC Compliance, FIU, Suspicious Activity Monitoring",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6673615003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5612143004",
        "title": "Senior Full-Stack Engineer - Risk Experience",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5612143004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6293488-operador-de-cobranca",
        "title": "Operador de Cobrança",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6293488-operador-de-cobranca",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/6c4b7542-7e1a-4f67-a812-bf92171a03eb?utm_source=jobs.a16z.com",
        "title": "Backend Engineer - Stablecoins",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/6c4b7542-7e1a-4f67-a812-bf92171a03eb?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/cf968a1b-e077-4111-8c00-9787195c9587?utm_source=jobs.a16z.com",
        "title": "Full Cycle Recruiter",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/cf968a1b-e077-4111-8c00-9787195c9587?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/OpenSea/4d81b74a-8ecd-4e45-bd30-19eb4c326c8c?utm_source=jobs.a16z.com",
        "title": "Creative AI Content Producer",
        "company": "OpenSea",
        "link": "https://jobs.ashbyhq.com/OpenSea/4d81b74a-8ecd-4e45-bd30-19eb4c326c8c?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7131896",
        "title": "Software Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7131896",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/8bec0191-f7d1-421e-844f-1a046845f9bd?utm_source=jobs.a16z.com",
        "title": "Account Executive, Enterprise | Italy",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/8bec0191-f7d1-421e-844f-1a046845f9bd?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7125787",
        "title": "Senior Mobile Engineer (Android)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7125787",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/3db63d5e-4285-4cfa-9c39-69f5d19eaf0f?lever-source%5B%5D=jobs.a16z.com",
        "title": "Technical Account Manager",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/3db63d5e-4285-4cfa-9c39-69f5d19eaf0f?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/dfinity/jobs/8111812002",
        "title": "Senior Site Reliability Engineer - Caffeinea.ai",
        "company": "DFINITY",
        "link": "https://job-boards.greenhouse.io/dfinity/jobs/8111812002",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6675196003",
        "title": "Analyst, Asset Management Loan Servicing",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6675196003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/4e559775-9c5a-4d81-949f-9c1737e86976?utm_source=jobs.a16z.com",
        "title": "Strategic Account Executive",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/4e559775-9c5a-4d81-949f-9c1737e86976?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c68dbca5-2927-46e3-8b24-a9c9a2847925?utm_source=jobs.a16z.com",
        "title": "HR Business Partner",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/c68dbca5-2927-46e3-8b24-a9c9a2847925?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7b82cb7d-8646-4879-bc96-2a614fced53d?utm_source=jobs.a16z.com",
        "title": "Account Executive, Expansion, SMB | UK&I",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7b82cb7d-8646-4879-bc96-2a614fced53d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/587cd202-756d-4a3a-8ae5-7dcde64e12a8?utm_source=jobs.a16z.com",
        "title": "Sales Development Representative, Enterprise | Benelux",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/587cd202-756d-4a3a-8ae5-7dcde64e12a8?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://apply.workable.com/j/F0FE188CDC",
        "title": "Affiliate Manager (Part-Time) - Otherworld Crypto Casino",
        "company": "Everyrealm",
        "link": "https://apply.workable.com/j/F0FE188CDC",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/4c22675a-9604-4425-a5b7-bc41786ec0e9?utm_source=jobs.a16z.com",
        "title": "Security Engineer, Detection & Response",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/4c22675a-9604-4425-a5b7-bc41786ec0e9?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/f7af86f0-4373-4eb1-a56b-216a9b60ea7b?utm_source=jobs.a16z.com",
        "title": "Senior Product Engineer, Full Stack",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/f7af86f0-4373-4eb1-a56b-216a9b60ea7b?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/96e12569-1f90-49e8-aeeb-bee19c5c1a83?utm_source=jobs.a16z.com",
        "title": "Payroll Specialist | France",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/96e12569-1f90-49e8-aeeb-bee19c5c1a83?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/OpenSea/67c67893-f7f7-44e9-8a94-976c4a5f2a86?utm_source=jobs.a16z.com",
        "title": "Staff Android Engineer",
        "company": "OpenSea",
        "link": "https://jobs.ashbyhq.com/OpenSea/67c67893-f7f7-44e9-8a94-976c4a5f2a86?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/43b1374d-5c5e-4b63-b710-a95e3cb76bbe?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Software Engineer - Credit ML Products",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/43b1374d-5c5e-4b63-b710-a95e3cb76bbe?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/1d3a494a-ca7d-4b25-afc5-dc32ce1fc50d?lever-source%5B%5D=jobs.a16z.com",
        "title": "Product Marketing Manager - Payments",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/1d3a494a-ca7d-4b25-afc5-dc32ce1fc50d?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4589896006",
        "title": "Senior Data Analyst, Valon Mortgage",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4589896006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://recruiterflow.com/coinswitch/jobs/550",
        "title": "Senior Business Associate ( Lemonn )",
        "company": "CoinSwitch Kuber",
        "link": "https://recruiterflow.com/coinswitch/jobs/550",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4590207006",
        "title": "Content Strategy Lead",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4590207006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/nansen/jobs/5614418004",
        "title": "Data Engineer",
        "company": "Nansen",
        "link": "https://job-boards.greenhouse.io/nansen/jobs/5614418004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/fcd4b58b-19fc-47f2-8c7a-a9aa149ebeb1?utm_source=jobs.a16z.com",
        "title": "Software Engineer Intern, Backend, Dealer",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/fcd4b58b-19fc-47f2-8c7a-a9aa149ebeb1?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/f035a438-3dde-4d4e-8349-e97e3017384a?utm_source=jobs.a16z.com",
        "title": "Software Engineer, Full Stack",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/f035a438-3dde-4d4e-8349-e97e3017384a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/0c150c16-ed0e-4f21-81d6-e85f67437f00?utm_source=jobs.a16z.com",
        "title": "Quantitative Analyst Intern",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/0c150c16-ed0e-4f21-81d6-e85f67437f00?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/2db01769-8f00-4652-b790-b7cff80bc891?utm_source=jobs.a16z.com",
        "title": "Software Engineer Intern, Front-End, PMS",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/2db01769-8f00-4652-b790-b7cff80bc891?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/17d32370-963c-4157-acc1-4e9cc9983779?utm_source=jobs.a16z.com",
        "title": "Client Services Intern, New York",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/17d32370-963c-4157-acc1-4e9cc9983779?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/c449d733-742e-4fa2-801d-cc757d4cbb98?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Denmark",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/c449d733-742e-4fa2-801d-cc757d4cbb98?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1cb4ad19-35c5-49dd-8c90-76cc169cace2?utm_source=jobs.a16z.com",
        "title": "Payroll Manager,  US",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1cb4ad19-35c5-49dd-8c90-76cc169cace2?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/f3d358c4-54e2-4cc8-afe2-8474fa13320b?utm_source=jobs.a16z.com",
        "title": "Software Engineer Intern, Backend, PMS",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/f3d358c4-54e2-4cc8-afe2-8474fa13320b?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/polychaincapital/jobs/7130183",
        "title": "Venture Research Analyst",
        "company": "Polychain Capital",
        "link": "https://job-boards.greenhouse.io/polychaincapital/jobs/7130183",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/1358c175-3049-4faf-aa88-73781512dfaf?utm_source=jobs.a16z.com",
        "title": "World Spaces Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/1358c175-3049-4faf-aa88-73781512dfaf?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/ef9d4dfc-ea4f-4965-9469-546ea4df467c?utm_source=jobs.a16z.com",
        "title": "World Spaces Manager",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/ef9d4dfc-ea4f-4965-9469-546ea4df467c?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/alchemy/jobs/4593927005",
        "title": "Sales Development Representative",
        "company": "Alchemy",
        "link": "https://job-boards.greenhouse.io/alchemy/jobs/4593927005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6276522-analista-de-credito-data-scientist",
        "title": "Analista de Crédito | Data scientist",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6276522-analista-de-credito-data-scientist",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/55080599-aa47-418e-bc86-4b2baf7a100b?utm_source=jobs.a16z.com",
        "title": "Go-To-Market Lead",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/55080599-aa47-418e-bc86-4b2baf7a100b?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/6c134303-b93d-47c9-b326-61b9180b26f8?lever-source%5B%5D=jobs.a16z.com",
        "title": "Senior Security GRC Analyst",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/6c134303-b93d-47c9-b326-61b9180b26f8?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/cruxclimate/2b291beb-a097-4426-8f5b-914b8903f29a?utm_source=jobs.a16z.com",
        "title": "Sr. Manager, Capital Markets - Transactions",
        "company": "Crux",
        "link": "https://jobs.ashbyhq.com/cruxclimate/2b291beb-a097-4426-8f5b-914b8903f29a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/676f2e71-f40d-42c1-9ebb-4148fbf48df7?utm_source=jobs.a16z.com",
        "title": "Growth Lead Merchant Engagement",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/676f2e71-f40d-42c1-9ebb-4148fbf48df7?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://branchinternational.applytojob.com/apply/zrevveTcf5/Compliance-Associate",
        "title": "Compliance Associate",
        "company": "Branch International",
        "link": "https://branchinternational.applytojob.com/apply/zrevveTcf5/Compliance-Associate",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/oplabs/bae3b733-ac0f-4236-be75-6ef3e9127842?utm_source=jobs.a16z.com",
        "title": "VP of Enterprise Sales",
        "company": "OP Labs",
        "link": "https://jobs.ashbyhq.com/oplabs/bae3b733-ac0f-4236-be75-6ef3e9127842?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6286077-analista-de-remuneracao-e-beneficios-pl",
        "title": "Analista de Remuneração e Benefícios PL",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6286077-analista-de-remuneracao-e-beneficios-pl",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/8badf24f-da5b-491c-994f-209b48f8e6a1?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (Swedish Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/8badf24f-da5b-491c-994f-209b48f8e6a1?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/92c9b733-75f5-4392-ab4c-30306db7b962?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (Dutch Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/92c9b733-75f5-4392-ab4c-30306db7b962?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/36016227-cce2-494b-bbd8-78b479a1030a?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (French Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/36016227-cce2-494b-bbd8-78b479a1030a?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/c75c8c5f-6cad-482a-8902-2f4b108048be?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (UK)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/c75c8c5f-6cad-482a-8902-2f4b108048be?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/041c3bae-f5fa-4862-899a-25e74ef313f4?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (Italian Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/041c3bae-f5fa-4862-899a-25e74ef313f4?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/d6357a38-6d6e-4384-8933-7ba55fcb5a32?lever-source%5B%5D=jobs.a16z.com",
        "title": "Business Development Manager (German Speaking)",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/d6357a38-6d6e-4384-8933-7ba55fcb5a32?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7125771",
        "title": "Senior Software Development Engineer Test (Mobile Automation)",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7125771",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6272470-sdr-outbound",
        "title": "SDR - Outbound",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6272470-sdr-outbound",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6653349003",
        "title": "Public Policy Analyst",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6653349003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.morpho.org/o/legal-manager-1",
        "title": "Legal Manager",
        "company": "Morpho Labs",
        "link": "https://jobs.morpho.org/o/legal-manager-1",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6673619003",
        "title": "APAC & MENA Sales Development Representative Intern",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6673619003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/529c3fe4-f606-44f9-86a7-7ffa8cfb1da4?utm_source=jobs.a16z.com",
        "title": "IT Engineer, Deel IT | LATAM",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/529c3fe4-f606-44f9-86a7-7ffa8cfb1da4?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bc4957cb-5a9a-4a66-a53b-8b24d7edd875?utm_source=jobs.a16z.com",
        "title": "Senior Manager, Payroll | South Africa",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bc4957cb-5a9a-4a66-a53b-8b24d7edd875?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/e3b9c3f4-5cb2-4533-b4d6-3f5d9771fc2f?utm_source=jobs.a16z.com",
        "title": "Associate Director, People Operations",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/e3b9c3f4-5cb2-4533-b4d6-3f5d9771fc2f?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/d4872706-8cba-452e-9dba-95a339348d82?utm_source=jobs.a16z.com",
        "title": "Sales Development Representative, Mobility | Turkey",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/d4872706-8cba-452e-9dba-95a339348d82?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/4d901a14-09e5-4350-943f-9a788071a306?utm_source=jobs.a16z.com",
        "title": "Product Data Analyst",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/4d901a14-09e5-4350-943f-9a788071a306?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/f90ad92a-f882-4bec-8a27-cc22d7da843b?lever-source%5B%5D=jobs.a16z.com",
        "title": "Account Executive, Financial Institutions",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/f90ad92a-f882-4bec-8a27-cc22d7da843b?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/tryjeeves/485c59da-634e-4be4-89c4-bd7413237bf6?lever-source%5B%5D=jobs.a16z.com",
        "title": "Account Executive",
        "company": "Jeeves",
        "link": "https://jobs.lever.co/tryjeeves/485c59da-634e-4be4-89c4-bd7413237bf6?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/tryjeeves/dc80fea9-3432-44ba-9f52-aa33f713b137?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Development Representative",
        "company": "Jeeves",
        "link": "https://jobs.lever.co/tryjeeves/dc80fea9-3432-44ba-9f52-aa33f713b137?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/40521504-758c-4302-96c6-41f4f6b5110d?utm_source=jobs.a16z.com",
        "title": "Software Engineer Intern, Connectivity",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/40521504-758c-4302-96c6-41f4f6b5110d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/e66ee272-aaaa-42d7-8904-9ac029adca3d?utm_source=jobs.a16z.com",
        "title": "Fraud Quality & Continuous Improvement Analyst",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/e66ee272-aaaa-42d7-8904-9ac029adca3d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/041ad8e6-892f-4a92-b086-4fb159d86962?utm_source=jobs.a16z.com",
        "title": "Senior Partnerships Manager | ANZ",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/041ad8e6-892f-4a92-b086-4fb159d86962?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/e86d4330-54e8-4bdc-8398-70cb5f751eed?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Argentina",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/e86d4330-54e8-4bdc-8398-70cb5f751eed?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/a8c52399-43ce-4e22-9451-ef8d20f518dd?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/a8c52399-43ce-4e22-9451-ef8d20f518dd?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://recruiterflow.com/coinswitch/jobs/549",
        "title": "Associate Manager - Compliance",
        "company": "CoinSwitch Kuber",
        "link": "https://recruiterflow.com/coinswitch/jobs/549",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/carta/jobs/6668008003",
        "title": "Accounts Receivable Accountant",
        "company": "Carta",
        "link": "https://job-boards.greenhouse.io/carta/jobs/6668008003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/e689b2bd-c99a-4d87-a9ac-bf9aefc35513?utm_source=jobs.a16z.com",
        "title": "Client Services Intern, London",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/e689b2bd-c99a-4d87-a9ac-bf9aefc35513?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/20de3e06-b144-4bcc-bdd0-19304295ae16?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/20de3e06-b144-4bcc-bdd0-19304295ae16?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Solana%20Foundation/6be29283-a2e0-48f4-b388-d06f48e240b3?utm_source=jobs.a16z.com",
        "title": "Solana Program Engineer",
        "company": "Solana Foundation",
        "link": "https://jobs.ashbyhq.com/Solana%20Foundation/6be29283-a2e0-48f4-b388-d06f48e240b3?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/72badd5f-65c5-43e7-889e-ad6315cdd9d2?utm_source=jobs.a16z.com",
        "title": "Payroll Associate | Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/72badd5f-65c5-43e7-889e-ad6315cdd9d2?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/0b0fc350-cc06-42ee-bfc7-b9b02f6e9e10?utm_source=jobs.a16z.com",
        "title": "Senior Manager, Account Executive, Mobility, Enterprise | North America",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/0b0fc350-cc06-42ee-bfc7-b9b02f6e9e10?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/1e2cb7b5-8ec3-4e1e-a64f-599d2e762b3a?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/1e2cb7b5-8ec3-4e1e-a64f-599d2e762b3a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Bastion/eecdd936-e6df-442a-9538-73fc72fa7af5?utm_source=jobs.a16z.com",
        "title": "Chief of Staff to the COO",
        "company": "Bastion",
        "link": "https://jobs.ashbyhq.com/Bastion/eecdd936-e6df-442a-9538-73fc72fa7af5?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/4111bcc1-c02d-4122-a1bc-839eda0fefa4?utm_source=jobs.a16z.com",
        "title": "Client Services Intern, Singapore",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/4111bcc1-c02d-4122-a1bc-839eda0fefa4?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/28db7efc-7956-40a8-b3d2-761f813cb78d?utm_source=jobs.a16z.com",
        "title": "Legal Counsel | Nordics",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/28db7efc-7956-40a8-b3d2-761f813cb78d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/ef92db32-3e2a-4ec0-ad40-6ac083322366?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/ef92db32-3e2a-4ec0-ad40-6ac083322366?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/563d8d3a-0c59-4660-b540-6d2f78abe8ad?utm_source=jobs.a16z.com",
        "title": "Payroll Expert | Brazil",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/563d8d3a-0c59-4660-b540-6d2f78abe8ad?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/eigen-labs/555aa727-9756-47ef-bd3d-61401c2bc86b?utm_source=jobs.a16z.com",
        "title": "Senior Accountant",
        "company": "EigenLayer",
        "link": "https://jobs.ashbyhq.com/eigen-labs/555aa727-9756-47ef-bd3d-61401c2bc86b?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/a31952af-be3d-4495-9638-888673c40424?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Engineer Manager - SMB",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/a31952af-be3d-4495-9638-888673c40424?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/98247648-3415-4a74-a28e-1ec425b0ad71?lever-source%5B%5D=jobs.a16z.com",
        "title": "Sales Engineer - SMB",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/98247648-3415-4a74-a28e-1ec425b0ad71?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/uniswaplabs/jobs/4586390005",
        "title": "Senior Design Lead",
        "company": "UniSwap",
        "link": "https://job-boards.greenhouse.io/uniswaplabs/jobs/4586390005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602673004",
        "title": "Compliance Risk Manager - Investments",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602673004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602671004",
        "title": "Senior Internal Auditor",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602671004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4589062006",
        "title": "Forward Deployed Engineer",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4589062006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.cedar.com/open-roles/?gh_jid=7118065",
        "title": "Sr. Group Lead, Implementation",
        "company": "Cedar",
        "link": "https://www.cedar.com/open-roles/?gh_jid=7118065",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602375004",
        "title": "Senior IT Auditor",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602375004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602361004",
        "title": "Compliance Training Program Manager",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602361004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/d4e5cf76-da8c-4af7-93eb-4237e0905d1b?utm_source=jobs.a16z.com",
        "title": "Fraud Trainer",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/d4e5cf76-da8c-4af7-93eb-4237e0905d1b?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/phantom/a7429fbb-7aa4-4901-916a-8ab06e0d091c?utm_source=jobs.a16z.com",
        "title": "Product Marketer",
        "company": "Phantom",
        "link": "https://jobs.ashbyhq.com/phantom/a7429fbb-7aa4-4901-916a-8ab06e0d091c?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/mercury/jobs/5602192004",
        "title": "Senior Card Fraud Investigator",
        "company": "Mercury",
        "link": "https://job-boards.greenhouse.io/mercury/jobs/5602192004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/momentmarkets/jobs/4806433007",
        "title": "People Operations Associate",
        "company": "Moment",
        "link": "https://job-boards.greenhouse.io/momentmarkets/jobs/4806433007",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4588927006",
        "title": "Counsel",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4588927006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6644889003",
        "title": "Associate, Talent Management Specialist",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6644889003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/uniswaplabs/jobs/4590829005",
        "title": "Senior Data Scientist",
        "company": "UniSwap",
        "link": "https://job-boards.greenhouse.io/uniswaplabs/jobs/4590829005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/propel/jobs/8098808002",
        "title": "Senior Growth Marketing Manager",
        "company": "Propel",
        "link": "https://job-boards.greenhouse.io/propel/jobs/8098808002",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/avalabs/jobs/5601116004",
        "title": "Senior Software Engineer, Core Web",
        "company": "Ava Labs",
        "link": "https://job-boards.greenhouse.io/avalabs/jobs/5601116004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/valon/jobs/4588897006",
        "title": "Default Analyst - Bankruptcy",
        "company": "Valon",
        "link": "https://job-boards.greenhouse.io/valon/jobs/4588897006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Adaptive/13157967-3db1-4360-9be5-2313706f74be?utm_source=jobs.a16z.com",
        "title": "Growth Engineer",
        "company": "Adaptive",
        "link": "https://jobs.ashbyhq.com/Adaptive/13157967-3db1-4360-9be5-2313706f74be?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/78f2ad3e-3730-45ad-91d1-605f80706fd8?utm_source=jobs.a16z.com",
        "title": "Associate Operations Manager, GTM Strategy",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/78f2ad3e-3730-45ad-91d1-605f80706fd8?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/18bd79de-2958-412e-b19c-94d13ecc78e7?utm_source=jobs.a16z.com",
        "title": "Staff Mechanical Engineer, Device",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/18bd79de-2958-412e-b19c-94d13ecc78e7?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/method/a379babd-9e7d-483e-a052-6e8dbd0f1cbc?utm_source=jobs.a16z.com",
        "title": "Design Engineer",
        "company": "Method",
        "link": "https://jobs.ashbyhq.com/method/a379babd-9e7d-483e-a052-6e8dbd0f1cbc?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/greenlight/f4babda9-189f-43c3-8bdc-66cfbe8d4a61?lever-source%5B%5D=jobs.a16z.com",
        "title": "Marketing Technology Manager",
        "company": "Greenlight",
        "link": "https://jobs.lever.co/greenlight/f4babda9-189f-43c3-8bdc-66cfbe8d4a61?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/paveakatroveinformationtechnologies/jobs/4591397005",
        "title": "Deal Desk Analyst",
        "company": "Pave",
        "link": "https://job-boards.greenhouse.io/paveakatroveinformationtechnologies/jobs/4591397005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/0be386af-bae2-4e0e-a7d3-3b104cf9e753?utm_source=jobs.a16z.com",
        "title": "Accountant I",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/0be386af-bae2-4e0e-a7d3-3b104cf9e753?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/2a38cb22-52ee-4b13-bb04-0d0b1e1841f1?utm_source=jobs.a16z.com",
        "title": "Senior Customer Success Manager, Enterprise | EMEA",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/2a38cb22-52ee-4b13-bb04-0d0b1e1841f1?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/664479d6-fecc-423c-8763-2d0986c137e1?lever-source%5B%5D=jobs.a16z.com",
        "title": "Product Marketing Manager - Europe",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/664479d6-fecc-423c-8763-2d0986c137e1?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/710aeb62-d457-4424-84b6-4ee133fafe37?lever-source%5B%5D=jobs.a16z.com",
        "title": "Growth Marketing Manager - Europe",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/710aeb62-d457-4424-84b6-4ee133fafe37?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://www.crossriver.com/greenhouse?gh_jid=6666584003",
        "title": "Analyst, MPL Accounting",
        "company": "Cross River",
        "link": "https://www.crossriver.com/greenhouse?gh_jid=6666584003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/7cebc6de-d064-4a84-8d07-c05d7786562c?utm_source=jobs.a16z.com",
        "title": "Payroll Analyst | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/7cebc6de-d064-4a84-8d07-c05d7786562c?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/blackbird/jobs/4588662006",
        "title": "Field Operations Contractor",
        "company": "Blackbird",
        "link": "https://job-boards.greenhouse.io/blackbird/jobs/4588662006",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/74accf80-9949-4bc9-8b6a-dce116b5d51d?utm_source=jobs.a16z.com",
        "title": "Sales Lead, South Korea",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/74accf80-9949-4bc9-8b6a-dce116b5d51d?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/d61d48f4-0ae2-4f9f-bbe5-a9116c2bb79b?utm_source=jobs.a16z.com",
        "title": "Senior Payroll Associate, Australia Payroll | Philippines & India",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/d61d48f4-0ae2-4f9f-bbe5-a9116c2bb79b?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Talos-Trading/9335b34f-a930-497f-bece-bca4c19506c1?utm_source=jobs.a16z.com",
        "title": "Corporate Strategy, Manager",
        "company": "Talos",
        "link": "https://jobs.ashbyhq.com/Talos-Trading/9335b34f-a930-497f-bece-bca4c19506c1?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/b02322bd-c9c8-4067-bf60-1bb4cf98b8bd?utm_source=jobs.a16z.com",
        "title": "Payroll Service Delivery Manager",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/b02322bd-c9c8-4067-bf60-1bb4cf98b8bd?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/43b1d0bd-94de-4d8a-aaea-cae67e03da2a?utm_source=jobs.a16z.com",
        "title": "Data Science Manager",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/43b1d0bd-94de-4d8a-aaea-cae67e03da2a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/tryjeeves/e6594e1f-1387-4556-a98c-7a31e9e03b4f?lever-source%5B%5D=jobs.a16z.com",
        "title": "Graphic Designer (Video & Social)",
        "company": "Jeeves",
        "link": "https://jobs.lever.co/tryjeeves/e6594e1f-1387-4556-a98c-7a31e9e03b4f?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/793d387f-ac66-4787-a383-3f9891c04551?lever-source%5B%5D=jobs.a16z.com",
        "title": "Backend Developer - Integrations",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/793d387f-ac66-4787-a383-3f9891c04551?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/yuno/da3c7b3f-edf7-4012-84f9-afdde7a607ed?lever-source%5B%5D=jobs.a16z.com",
        "title": "Technical Support Analyst",
        "company": "Yuno",
        "link": "https://jobs.lever.co/yuno/da3c7b3f-edf7-4012-84f9-afdde7a607ed?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.eu.greenhouse.io/gensyn/jobs/4648121101",
        "title": "Developer Advocate",
        "company": "Gensyn",
        "link": "https://job-boards.eu.greenhouse.io/gensyn/jobs/4648121101",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://wellfound.com/jobs/3351333-ios-developer-remote-friendly",
        "title": "iOS Developer (Remote Friendly)",
        "company": "Tellus",
        "link": "https://wellfound.com/jobs/3351333-ios-developer-remote-friendly",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6249498-senior-application-security",
        "title": "Senior Application Security",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6249498-senior-application-security",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/aptoslabs/jobs/4592269005",
        "title": "Software Engineer, Product",
        "company": "Aptos Labs",
        "link": "https://job-boards.greenhouse.io/aptoslabs/jobs/4592269005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/88ac445b-635d-45d1-8ad7-1e4aadb6317a?utm_source=jobs.a16z.com",
        "title": "Payroll Specialist | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/88ac445b-635d-45d1-8ad7-1e4aadb6317a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/plaid/529e32e5-d849-498f-b313-29b6cc99e593?lever-source%5B%5D=jobs.a16z.com",
        "title": "Account Executive - Named: FinTech",
        "company": "Plaid",
        "link": "https://jobs.lever.co/plaid/529e32e5-d849-498f-b313-29b6cc99e593?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sentilink/21f8b592-3242-4ec9-8549-63bccafd0744?utm_source=jobs.a16z.com",
        "title": "Senior Infrastructure Engineer",
        "company": "SentiLink",
        "link": "https://jobs.ashbyhq.com/sentilink/21f8b592-3242-4ec9-8549-63bccafd0744?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/f33685be-a046-43b1-90db-fb95653495a4?utm_source=jobs.a16z.com",
        "title": "Sales Development Representative, Mobility | North America",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/f33685be-a046-43b1-90db-fb95653495a4?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6249518-analista-de-fp-a-senior",
        "title": "Analista de FP&A - Sênior",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6249518-analista-de-fp-a-senior",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/32ff3681-d94e-4b03-90e4-8fc43343dd8f?utm_source=jobs.a16z.com",
        "title": "Account Executive, Expansion, SMB",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/32ff3681-d94e-4b03-90e4-8fc43343dd8f?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/OpenSea/d7331acd-347c-4c64-8858-6c092bed484b?utm_source=jobs.a16z.com",
        "title": "Staff Data Engineer",
        "company": "OpenSea",
        "link": "https://jobs.ashbyhq.com/OpenSea/d7331acd-347c-4c64-8858-6c092bed484b?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/9eb9e880-d800-4b13-bf8b-c4724be8b763?utm_source=jobs.a16z.com",
        "title": "Tech Lead, Software QA Excellence",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/9eb9e880-d800-4b13-bf8b-c4724be8b763?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/sardine/cd984805-70c2-4c77-b0ac-17fc53fa0427?utm_source=jobs.a16z.com",
        "title": "Senior Software Engineer - Data Platform",
        "company": "Sardine",
        "link": "https://jobs.ashbyhq.com/sardine/cd984805-70c2-4c77-b0ac-17fc53fa0427?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/bb9b04fc-3472-49b9-9245-678ea2f710dc?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Netherlands",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/bb9b04fc-3472-49b9-9245-678ea2f710dc?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/addi/3b22b9d3-d177-4c93-9f6d-99d7e84b1ec5?utm_source=jobs.a16z.com",
        "title": "Senior Business Analyst, Lending",
        "company": "ADDI",
        "link": "https://jobs.ashbyhq.com/addi/3b22b9d3-d177-4c93-9f6d-99d7e84b1ec5?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6242454-executivo-de-contas-crm",
        "title": "Executivo de Contas | CRM",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6242454-executivo-de-contas-crm",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/b81ebc9a-9cc7-4c8d-9893-d940ae20df0a?utm_source=jobs.a16z.com",
        "title": "Payroll Associate | Mexico",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/b81ebc9a-9cc7-4c8d-9893-d940ae20df0a?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/wingspan/jobs/6668877003",
        "title": "Contractor Support Specialist",
        "company": "Wingspan",
        "link": "https://job-boards.greenhouse.io/wingspan/jobs/6668877003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/wingspan/jobs/6668878003",
        "title": "Contractor Support Specialist",
        "company": "Wingspan",
        "link": "https://job-boards.greenhouse.io/wingspan/jobs/6668878003",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Deel/ab6a16a7-8bcb-4b20-9dc3-6c1d93816380?utm_source=jobs.a16z.com",
        "title": "Payroll Implementation Manager | Portugal",
        "company": "Deel",
        "link": "https://jobs.ashbyhq.com/Deel/ab6a16a7-8bcb-4b20-9dc3-6c1d93816380?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/081258fe-1322-4e2e-b217-ce8deedd1fc5?utm_source=jobs.a16z.com",
        "title": "Senior Embedded Software Engineer, OrbMini",
        "company": "Worldcoin",
        "link": "https://jobs.ashbyhq.com/Tools%20for%20Humanity/081258fe-1322-4e2e-b217-ce8deedd1fc5?utm_source=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://careers.kula.ai/flow-com/10708",
        "title": "Head of Product Marketing",
        "company": "Flow Blockchain",
        "link": "https://careers.kula.ai/flow-com/10708",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://loft.teamtailor.com/jobs/6249530-lead-analytics-engineer",
        "title": "Lead Analytics Engineer",
        "company": "Loft",
        "link": "https://loft.teamtailor.com/jobs/6249530-lead-analytics-engineer",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://jobs.lever.co/tryjeeves/220ad848-413c-4d2c-ab1a-776bcfcc8028?lever-source%5B%5D=jobs.a16z.com",
        "title": "Head of Marketing",
        "company": "Jeeves",
        "link": "https://jobs.lever.co/tryjeeves/220ad848-413c-4d2c-ab1a-776bcfcc8028?lever-source%5B%5D=jobs.a16z.com",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4514382005",
        "title": "Senior Data Engineer",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4514382005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4204502005",
        "title": "Senior Front-end Software Engineer (React Native)",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4204502005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/10",
        "title": "Content & Special Projects Lead",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/10",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4360162005",
        "title": "Product Manager",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4360162005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4292324005",
        "title": "Midlevel Software Engineer",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4292324005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5596786004",
        "title": "HR Generalist",
        "company": "LayerZero Labs",
        "link": "https://job-boards.greenhouse.io/layerzerolabs/jobs/5596786004",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://job-boards.greenhouse.io/earnin/jobs/7093414",
        "title": "Machine Learning Engineer",
        "company": "Earnin",
        "link": "https://job-boards.greenhouse.io/earnin/jobs/7093414",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4204472005",
        "title": "Backend Senior Software Engineer",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4204472005",
        "date": "2025-08-15T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://people-job-posts.vercel.app/jobs/4383485005",
        "title": "Customer Experience Analyst",
        "company": "NG.CASH",
        "link": "https://people-job-posts.vercel.app/jobs/4383485005",
        "date": "2025-08-15T12:00:00Z",
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

// Helper to remove emojis and other non-standard characters from job titles
function cleanTitle(text: string | undefined): string | undefined {
  if (!text) return undefined;
  // This regex removes a wide range of symbols, emojis, and non-standard characters
  return text.replace(/[^a-z0-9\\s.,-–—_()|/\\&+#@:'’`´~!?$%[\\]{}]/gi, '').trim();
}


export async function getJobs(): Promise<Job[]> {
  const jobMap = new Map<string, Job>();

  // Helper to add a job to the map, checking for duplicates based on title and company
  const addJobToMap = (job: Job) => {
    const uniqueKey = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
    if (!jobMap.has(uniqueKey)) {
        jobMap.set(uniqueKey, job);
    }
  };

  // Prioritize manual jobs by adding them to the map first
  MANUAL_JOBS.forEach(job => {
    // We use a different key here to ensure manual jobs are always unique if their link is unique
    const uniqueKeyForManual = `${job.title.toLowerCase()}|${job.company.toLowerCase()}`;
     if (!jobMap.has(uniqueKeyForManual)) {
        jobMap.set(uniqueKeyForManual, job);
    }
  });

  const allJobsPromises = FEEDS.map(async (feedUrl) => {
    try {
      const feed = await parser.parseURL(feedUrl);
      if (feed?.items) {
        feed.items.forEach((item) => {
          const title = cleanTitle(item.title);
          const company = cleanCompany(item.content);
          const link = item.link;

          if (link && title && company && title.split(' ').length <= 8 && !title.toLowerCase().includes('bounty')) {
            addJobToMap({
                id: item.guid || link,
                title,
                company,
                link,
                date: item.isoDate || new Date().toISOString(),
                source: feed.title || feedUrl,
            });
          }
        });
      }
    } catch (error) {
      console.warn(`Could not fetch or parse feed: ${feedUrl}`, error);
    }
  });

  await Promise.all(allJobsPromises);
  
  let uniqueJobs = Array.from(jobMap.values());

  uniqueJobs = uniqueJobs.filter(job => 
    job.company.toLowerCase() !== 'crusoe' && 
    !(job.company.toLowerCase() === 'interop labs' && job.title.toLowerCase().includes('interested in working with us'))
  );

  uniqueJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return uniqueJobs;
}