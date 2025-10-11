
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Resume Builder',
  description: 'Create a professional, crypto-native resume that stands out to recruiters. Build and download your Web3 resume for free.',
  alternates: {
    canonical: '/resume-builder',
  },
  openGraph: {
    title: 'Web3 Resume Builder',
    description: 'Craft a resume tailored for the Web3 job market. Our free builder helps you highlight your on-chain experience.',
    url: 'https://hashtagweb3.com/resume-builder',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Resume Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Resume Builder',
    description: 'Craft a resume that gets noticed in the crypto space.',
    images: ['https://hashtagweb3.com/og-image.png'],
  },
};

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
