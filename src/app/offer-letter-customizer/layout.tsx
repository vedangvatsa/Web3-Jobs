
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Offer Letter Customizer | Free Tool',
  description: 'Generate professional offer letters for Web3 roles. Our free tool helps you easily customize salary, token allocation, and vesting schedules to attract top talent.',
  alternates: {
    canonical: '/offer-letter-customizer',
  },
  openGraph: {
    title: 'Web3 Offer Letter Customizer | Free Tool',
    description: 'Create and download professional offer letters for your next Web3 hire. Free and easy to use.',
    url: 'https://hashtagweb3.com/offer-letter-customizer',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-tools.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Offer Letter Customizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Offer Letter Customizer | Free Tool',
    description: 'Create professional offer letters for Web3 roles in seconds.',
    images: ['https://hashtagweb3.com/og-image-tools.png'],
  },
};

export default function OfferLetterCustomizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
