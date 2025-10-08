
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Salary Calculator',
  description: 'Estimate your salary in the Web3 industry based on your role, experience, and location. Get a data-driven salary estimate for developer, marketing, and PM roles.',
  alternates: {
    canonical: '/salary-calculator',
  },
  openGraph: {
    title: 'Web3 Salary Calculator',
    description: 'Curious what you could earn in Web3? Use our calculator to get an estimated salary for your role.',
    url: 'https://hashtagweb3.com/salary-calculator',
    images: [
      {
        url: 'https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg',
        width: 1200,
        height: 630,
        alt: 'Web3 Salary Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Salary Calculator | Hashtag Web3',
    description: 'Estimate your potential salary in the crypto industry.',
    images: ['https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg'],
  },
};


export default function SalaryCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
