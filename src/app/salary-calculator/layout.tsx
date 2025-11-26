
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Salary Calculator | Estimate Your Crypto Job Salary',
  description: 'Estimate your salary in the Web3 industry. Get data-driven salary estimates for developer, marketing, and product manager roles in crypto.',
  alternates: {
    canonical: '/salary-calculator',
  },
  openGraph: {
    title: 'Web3 Salary Calculator | Estimate Your Crypto Job Salary',
    description: 'Curious what you could earn in Web3? Use our calculator to get an estimated salary for your role.',
    url: 'https://hashtagweb3.com/salary-calculator',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Salary Calculator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Salary Calculator | Estimate Your Crypto Job Salary',
    description: 'Estimate your potential salary in the crypto industry.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};


export default function SalaryCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
