
import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Offer Letter Tool',
 description: 'Generate professional offer letters for Web3 roles. Customize salary, token allocation, and vesting schedules to attract top talent.',
 alternates: {
  canonical: 'https://hashtagweb3.com/offer-letter-customizer',
 },
 openGraph: {
  type: 'website',
  title: 'Offer Letter Tool | Hashtag Web3',
  description: 'Create and download professional, customized offer letters for your next Web3 hire. Free and easy to use.',
  url: 'https://hashtagweb3.com/offer-letter-customizer',
  images: [
   {
    url: 'https://hashtagweb3.com/api/og?type=default&title=Web3%20Offer%20Letter%20Customizer',
    width: 1200,
    height: 630,
    alt: 'Web3 Offer Letter Customizer',
   },
  ],
 },
 twitter: {
  card: 'summary_large_image',
  title: 'Offer Letter Tool | Hashtag Web3',
  description: 'Create professional offer letters for Web3 roles in seconds.',
  images: ['https://hashtagweb3.com/api/og?type=default&title=Web3%20Offer%20Letter%20Customizer'],
 },
};

export default function OfferLetterCustomizerLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
