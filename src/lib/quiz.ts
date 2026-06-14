
import type { QuizQuestion, QuizResult } from '@/types';

export const quizData: QuizQuestion[] = [
 {
  id: 1,
  question:"When faced with a complex problem, your first instinct is to:",
  options: {
   a:"Break it down into logical pieces and build a solution step-by-step.",
   b:"Understand the high-level goals and create a long-term plan.",
  },
  weights: {
   a: { builder: 2, analyst: 1 },
   b: { strategist: 2 },
  },
 },
 {
  id: 2,
  question:"You find a new, exciting technology. You are more likely to:",
  options: {
   a:"Immediately start tinkering with it to see what you can create.",
   b:"Research its market potential and competitive landscape.",
  },
  weights: {
   a: { builder: 2 },
   b: { strategist: 1, analyst: 1 },
  },
 },
 {
  id: 3,
  question:"In a team project, you naturally gravitate towards:",
  options: {
   a:"Organizing the discussion, setting agendas, and making sure everyone is heard.",
   b:"Digging into the data to find insights that support the team's decisions.",
  },
  weights: {
   a: { weaver: 2, strategist: 1 },
   b: { analyst: 2 },
  },
 },
 {
  id: 4,
  question:"What sounds more appealing?",
  options: {
   a:"Facilitating a large, active online community.",
   b:"Designing a token-based economic system.",
  },
  weights: {
   a: { weaver: 2 },
   b: { strategist: 2, builder: 1 },
  },
 },
 {
  id: 5,
  question:"When learning something new, you prefer:",
  options: {
   a:"A structured course with clear data and examples.",
   b:"Open-ended exploration and talking to different people to get their perspectives.",
  },
  weights: {
   a: { analyst: 2 },
   b: { weaver: 1, strategist: 1 },
  },
 },
 {
  id: 6,
  question:"Your favorite part of a project is:",
  options: {
   a:"The initial brainstorming and big picture vision.",
   b:"The hands-on process of actually creating the thing.",
  },
  weights: {
   a: { strategist: 2 },
   b: { builder: 2 },
  },
 },
 {
  id: 7,
  question:"You are most energized when you are:",
  options: {
   a:"Connecting people and fostering collaboration.",
   b:"Solving a difficult, technical puzzle alone.",
  },
  weights: {
   a: { weaver: 2 },
   b: { builder: 2, analyst: 1 },
  },
 },
 {
  id: 8,
  question:"Which statement resonates more with you?",
  options: {
   a:"The story and the 'why' are what truly matter.",
   b:"The data doesn't lie.",
  },
  weights: {
   a: { weaver: 1, strategist: 1 },
   b: { analyst: 2 },
  },
 },
 {
  id: 9,
  question:"Which Web3 sector fascinates you more?",
  options: {
   a:"DeFi: Rebuilding the financial system with code.",
   b:"NFTs & Gaming: Creating new forms of digital culture and ownership.",
  },
  weights: {
   a: { builder: 1, analyst: 1, strategist: 1 },
   b: { weaver: 2 },
  },
 },
 {
  id: 10,
  question:"When evaluating a new Web3 project, you first look at:",
  options: {
   a:"The quality of their code on GitHub.",
   b:"The engagement and vibe in their Discord community.",
  },
  weights: {
   a: { builder: 2, analyst: 1 },
   b: { weaver: 2 },
  },
 },
 {
  id: 11,
  question:"You see a complex governance proposal in a DAO. Your reaction is to:",
  options: {
   a:"Analyze its potential economic impact and long-term consequences.",
   b:"Wait to see what trusted community members are saying about it.",
  },
  weights: {
   a: { strategist: 2, analyst: 1 },
   b: { weaver: 1 },
  },
 },
 {
  id: 12,
  question:"What's a more exciting challenge?",
  options: {
   a:"Designing a secure system to manage billions of dollars in assets.",
   b:"Designing a go-to-market strategy to onboard the next million users.",
  },
  weights: {
   a: { builder: 1, strategist: 1 },
   b: { weaver: 2, strategist: 1 },
  },
 },
 {
  id: 13,
  question:"When it comes to risk, you prefer:",
  options: {
   a:"Calculated risks based on models and data analysis.",
   b:"High-level strategic risks with asymmetric upside.",
  },
  weights: {
   a: { analyst: 2 },
   b: { strategist: 2 },
  },
 },
 {
  id: 14,
  question:"Your ideal work environment is:",
  options: {
   a:"A small, focused team shipping code and features at a rapid pace.",
   b:"A large, distributed network of contributors collaborating on shared goals.",
  },
  weights: {
   a: { builder: 2 },
   b: { weaver: 2, strategist: 1 },
  },
 },
 {
  id: 15,
  question:"Which task sounds more interesting?",
  options: {
   a:"Writing a detailed specification for a new protocol feature.",
   b:"Writing a deep-dive analysis of on-chain user behavior.",
  },
  weights: {
   a: { strategist: 1, builder: 1 },
   b: { analyst: 2 },
  },
 },
 {
  id: 16,
  question:"You believe the key to Web3's success is:",
  options: {
   a:"Building killer applications with a seamless user experience.",
   b:"Building active, resilient communities with strong governance.",
  },
  weights: {
   a: { builder: 1, strategist: 1 },
   b: { weaver: 2 },
  },
 },
];

const results: Record<string, QuizResult> = {
 builder: {
  archetype: 'The Builder',
  description:"You are a hands-on creator who loves to build. You're driven by the challenge of solving complex technical problems and bringing ideas to life through code. Your satisfaction comes from shipping products and creating tangible value.",
  traits: [
   'Problem-solver',
   'Technically proficient',
   'Enjoys hands-on work',
   'Detail-oriented',
  ],
  roles: [
   { title: 'Smart Contract Developer', description: 'Writes the on-chain logic for dApps.' },
   { title: 'Frontend/Web3 Developer', description: 'Builds the user interfaces for dApps.' },
   { title: 'Protocol Engineer', description: 'Works on the core blockchain infrastructure.' },
  ],
 },
 strategist: {
  archetype: 'The Strategist',
  description:"You are a big-picture thinker who excels at understanding complex systems and charting a course for the future. You enjoy analyzing markets, designing economic models, and defining the long-term vision of a project.",
  traits: [
   'Forward-thinking',
   'Systems-level thinker',
   'Enjoys high-level planning',
   'Good at spotting trends',
  ],
  roles: [
   { title: 'Web3 Product Manager', description: 'Guides the vision and roadmap of a decentralized product.' },
   { title: 'Tokenomics Designer', description: 'Architects the economic incentives of a protocol.' },
   { title: 'VC / Investment Analyst', description: 'Identifies and invests in promising new Web3 projects.' },
  ],
 },
 analyst: {
  archetype: 'The Analyst',
  description:"You are driven by data and logic. You have a talent for sifting through information, finding patterns, and providing the objective insights that guide a project's strategy. You believe in a 'trust, but verify' approach.",
  traits: [
   'Data-driven',
   'Detail-oriented',
   'Enjoys research and investigation',
   'Values objectivity and proof',
  ],
  roles: [
   { title: 'On-Chain Data Analyst', description: 'Uses tools like Dune to analyze blockchain data.' },
   { title: 'Smart Contract Auditor', description: 'Finds security vulnerabilities in smart contracts.' },
   { title: 'Quantitative Analyst', description: 'Models the financial risks of DeFi protocols.' },
  ],
 },
 weaver: {
  archetype: 'The Community Weaver',
  description:"You are a natural connector of people. You thrive on building relationships, fostering collaboration, and creating a strong, positive culture. You understand that the strength of a Web3 project lies in its community.",
  traits: [
   'High emotional intelligence',
   'Excellent communicator',
   'Relationship-focused',
   'Enjoys helping others',
  ],
  roles: [
   { title: 'Community Manager', description: 'Manages the Discord and acts as the heart of the project.' },
   { title: 'Marketing / Growth Lead', description: 'Tells the project\'s story and builds partnerships.' },
   { title: 'Developer Relations (DevRel)', description: 'Supports and grows the developer ecosystem.' },
  ],
 },
};

export function getResult(answers: Record<string, 'a' | 'b'>): QuizResult {
 const scores = { builder: 0, strategist: 0, analyst: 0, weaver: 0 };

 for (const question of quizData) {
  const answer = answers[question.id];
  if (answer) {
   const weights = question.weights[answer];
   for (const archetype in weights) {
    if (Object.prototype.hasOwnProperty.call(scores, archetype)) {
      scores[archetype as keyof typeof scores] += weights[archetype as keyof typeof weights] || 0;
    }
   }
  }
 }

 const highestArchetype = Object.keys(scores).reduce((a, b) =>
  scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b
 );

 return results[highestArchetype];
}
