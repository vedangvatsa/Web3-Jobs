
import { LogoStrip } from '@/components/logo-strip';

export function TrustedBy() {
  const logos = [
    { name: 'LBank', src: '/logo/job/lbank.png?v=2' },
    { name: 'dYdX', src: '/logo/job/dydx.png?v=2' },
    { name: 'Coinbase', src: '/logo/job/coinbase.png?v=2' },
    { name: 'Bitget', src: '/logo/job/bitget.png?v=2' },
    { name: 'Binance', src: '/logo/job/binance.png?v=2' },
    { name: 'Circle', src: '/logo/job/circle.png?v=2' },
  ];

  return <LogoStrip title="Jobs from companies like:" logos={logos} />;
}
