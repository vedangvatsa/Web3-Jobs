
'use server';

import Parser from 'rss-parser';
import type { Job } from '@/types';
import fs from 'fs/promises';
import path from 'path';

// The jobs you manually added are now stored here permanently.
const MANUAL_JOBS: Job[] = [
    {
        "id": "https://hire-r1.mokahr.com/su/Gm7S8",
        "title": "Institutional Business Development Manager (Japanese speaker)",
        "company": "Bitget",
        "link": "https://hire-r1.mokahr.com/su/Gm7S8",
        "date": "2025-08-16T12:00:00Z",
        "source": "Manual"
    },
    {
        "id": "https://hire-r1.mokahr.com/su/VdbJt",
        "title": "Institutional Business Development Manager (Russian speaker)",
        "company": "Bitget",
        "link": "https://hire-r1.mokahr.com/su/VdbJt",
        "date": "2025-08-16T12:00:00Z",
        "source": "Manual"
    },
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
  'https://politepaul.com/fd/JEeZwG4KK7uT.xml', // Dragonfly
  'https://politepaul.com/fd/sDzglCq7RCpG.xml', // Paradigm
  'https://politepaul.com/fd/bs9i34afSjHS.xml', // Arbitrum
  'https://politepaul.com/fd/oiXKHETnrDap.xml', // a16z
  'https://politepaul.com/fd/Ane01VX84MOk.xml', // Pantera
  'https://politepaul.com/fd/HI6pMDlyEO7j.xml',  // Avalanche
  'https://politepaul.com/fd/uIQRejBOTRjO.xml',
  'https://politepaul.com/fd/qglK0E9cQDYB.xml',
  'https://politepaul.com/fd/UEGwYfx1fQ9R.xml',
  'https://politepaul.com/fd/fEgzbFDDrmRe.xml',
  'https://politepaul.com/fd/KTQjDJIFxvZY.xml'
];

const parser = new Parser();
const jobsCachePath = path.join(process.cwd(), '.cache/jobs-cache.json');

// Helper to clean company names
function cleanCompany(company: string | undefined): string | undefined {
    if (!company) return undefined;
    return company.replace(/<[^>]*>?/gm, '').split('\\n')[0].trim();
}

// Helper to remove emojis and other non-standard characters from job titles
function cleanTitle(text: string | undefined): string | undefined {
  if (!text) return undefined;
  // This regex removes a wide range of symbols and emojis, but preserves asterisks for later filtering.
  return text.replace(/[^a-z0-9\\s.,-–—_()|/\\&+#@:'’`´~!?$%[\\]{}*]/gi, '').trim();
}


async function readJobsCache(): Promise<Job[]> {
  try {
    await fs.access(jobsCachePath);
    const data = await fs.readFile(jobsCachePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If the file doesn't exist or is invalid, return an empty array
    return [];
  }
}

async function writeJobsCache(jobs: Job[]): Promise<void> {
  const dir = path.dirname(jobsCachePath);
  try {
    await fs.access(dir);
  } catch (error) {
    await fs.mkdir(dir, { recursive: true });
  }
  await fs.writeFile(jobsCachePath, JSON.stringify(jobs, null, 2));
}

// New helper for creating a robust unique key
function createUniqueKey(title: string, company: string): string {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/gi, '');
    return `${normalize(title)}|${normalize(company)}`;
}


export async function getJobs(): Promise<Job[]> {
  const cachedJobs = await readJobsCache();
  const jobMap = new Map<string, Job>();

  // Load manual and cached jobs into the map
  [...MANUAL_JOBS, ...cachedJobs].forEach(job => {
    const uniqueKey = createUniqueKey(job.title, job.company);
    if (!jobMap.has(uniqueKey)) {
        jobMap.set(uniqueKey, job);
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

          if (link && title && company && !title.includes('*') && title.split(' ').length <= 8 && !title.toLowerCase().includes('bounty')) {
            const uniqueKey = createUniqueKey(title, company);
            if (!jobMap.has(uniqueKey)) {
                const newJob: Job = {
                    id: item.guid || link,
                    title,
                    company,
                    link,
                    date: item.isoDate || new Date().toISOString(),
                    source: feed.title || feedUrl,
                };
                jobMap.set(uniqueKey, newJob);
            }
          }
        });
      }
    } catch (error) {
      console.warn(`Could not fetch or parse feed: ${feedUrl}`, error);
    }
  });

  await Promise.all(allJobsPromises);
  
  let allJobs = Array.from(jobMap.values());

  // Filter out jobs older than 30 days (1 month), but keep manual jobs forever
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const freshJobs = allJobs.filter(job => {
      if (job.source === 'Manual') {
          return true;
      }
      return new Date(job.date) > thirtyDaysAgo;
  });

  // Filter out unwanted company jobs and titles with asterisks
  let uniqueJobs = freshJobs.filter(job => 
    job.company.toLowerCase() !== 'crusoe' && 
    !(job.company.toLowerCase() === 'interop labs' && job.title.toLowerCase().includes('interested in working with us')) &&
    job.company.toLowerCase() !== 'florida street' &&
    !job.title.includes('*') &&
    job.company.toLowerCase() !== 'wyoming stable token commission'
  );

  uniqueJobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Update the cache with the new combined and filtered list
  // We only cache the non-manual jobs
  const jobsToCache = uniqueJobs.filter(j => j.source !== 'Manual');
  await writeJobsCache(jobsToCache);

  return uniqueJobs;
}
