
import { LogoStrip } from '@/components/logo-strip';

export function TrustedBy() {
  const logos = [
    { name: 'LBank', src: '/logo/job/lbank.webp' },
    { name: 'dYdX', src: '/logo/job/dydx.webp' },
    { name: 'Coinbase', src: '/logo/job/coinbase.webp' },
    { name: 'Bitget', src: '/logo/job/bitget.webp' },
    { name: 'Binance', src: '/logo/job/binance.webp' },
    { name: 'Circle', src: '/logo/companies/circle.webp' },
  ];

  return <LogoStrip title="Jobs from companies like:" logos={logos} />;
}
