import { permanentRedirect } from 'next/navigation';

/** Legacy API-policy URL; catalogs live under /data/. */
export default function ApiPolicyPage() {
  permanentRedirect('/developers');
}
