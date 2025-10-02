
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Web3 Offer Letter Customizer',
  description: 'Generate professional offer letters for Web3 roles. Easily customize details like salary, token allocation, and vesting schedules to attract top talent.',
  openGraph: {
    title: 'Web3 Offer Letter Customizer | Hashtag Web3',
    description: 'Create and download professional offer letters for your next Web3 hire. Free and easy to use.',
    images: [
      {
        url: 'https://hashtagweb3.com/og-image-offer-letter.png',
        width: 1200,
        height: 630,
        alt: 'Web3 Offer Letter Customizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web3 Offer Letter Customizer | Hashtag Web3',
    description: 'Create professional offer letters for Web3 roles in seconds.',
    images: ['https://hashtagweb3.com/og-image-offer-letter.png'],
  },
};

export default function OfferLetterCustomizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
