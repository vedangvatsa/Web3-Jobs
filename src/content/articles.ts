
import type { Article } from '@/types';
import { article as topWeb3CompaniesHiring } from './articles/top-web3-companies-hiring';
import { article as nonTechnicalRolesInCrypto } from './articles/non-technical-roles-in-crypto';
import { article as guideToSmartContractAuditing } from './articles/guide-to-smart-contract-auditing';
import { article as web3CommunityManagerJobs } from './articles/web3-community-manager-jobs';
import { article as technicalWritingForWeb3 } from './articles/technical-writing-for-web3';
import { article as remoteWeb3Jobs } from './articles/remote-web3-jobs';
import { article as web3InternshipsForStudents } from './articles/web3-internships-for-students';
import { article as web3GamingJobs } from './articles/web3-gaming-jobs';
import { article as daoGovernanceCareers } from './articles/dao-governance-careers';
import { article as web3InterviewQuestions } from './articles/web3-interview-questions';
import { article as web3ResumeGuide } from './articles/web3-resume-guide';
import { article as solanaDeveloperCareers } from './articles/solana-developer-careers';
import { article as aiInWeb3 } from './articles/ai-in-web3';
import { article as cryptoDeveloperTools } from './articles/crypto-developer-tools';
import { article as web3ProductManagerJobs } from './articles/web3-product-manager-jobs';
import { article as cryptoDataAnalystJobs } from './articles/crypto-data-analyst-jobs';
import { article as web3DevrelCareers } from './articles/web3-devrel-careers';
import { article as web3DesignCareers } from './articles/web3-design-careers';


const articles: Article[] = [
  topWeb3CompaniesHiring,
  nonTechnicalRolesInCrypto,
  guideToSmartContractAuditing,
  web3CommunityManagerJobs,
  technicalWritingForWeb3,
  remoteWeb3Jobs,
  web3InternshipsForStudents,
  web3GamingJobs,
  daoGovernanceCareers,
  web3InterviewQuestions,
  web3ResumeGuide,
  solanaDeveloperCareers,
  aiInWeb3,
  cryptoDeveloperTools,
  web3ProductManagerJobs,
  cryptoDataAnalystJobs,
  web3DevrelCareers,
  web3DesignCareers,
];

export function getArticles() {
  return articles;
}

export function getArticle(slug: string) {
  return articles.find(article => article.slug === slug);
}
