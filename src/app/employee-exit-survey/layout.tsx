
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Employee Exit Survey Tool',
  description: 'A free tool to generate a comprehensive employee exit survey. Gather valuable feedback from departing team members to improve your company culture.',
  openGraph: {
    title: 'Employee Exit Survey Tool',
    description: 'Understand why employees leave and how you can improve. Create a professional exit survey with our free tool.',
    images: [
      {
        url: 'https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg',
        width: 1200,
        height: 630,
        alt: 'Employee Exit Survey Tool',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Employee Exit Survey Tool | Hashtag Web3',
    description: 'Create professional employee exit surveys in seconds.',
    images: ['https://hashtagweb3.com/logo/previews/Hashtag%20Web3%20Community.jpeg'],
  },
};

export default function EmployeeExitSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
