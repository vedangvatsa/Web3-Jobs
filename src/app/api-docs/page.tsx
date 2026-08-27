import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hashtag Web3 API Docs',
  description: 'Official API documentation and endpoint reference for Hashtag Web3.',
  alternates: {
    canonical: 'https://hashtagweb3.com/developers',
  },
};

export default function ApiDocsRedirect() {
  redirect('/developers');
}
