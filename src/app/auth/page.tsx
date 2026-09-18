import { permanentRedirect } from 'next/navigation';

/** Agent auth endpoints were removed; keep the URL as a quiet redirect. */
export default function AuthPage() {
  permanentRedirect('/developers');
}
