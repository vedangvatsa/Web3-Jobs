
import { LogoStrip } from '@/components/logo-strip';

export function TrustedBy() {
  // LBank/Coinbase assets include vertical padding (~68% fill → ~22px glyphs at
  // maxH 28). Edge-to-edge wordmarks need a lower maxHeight to match.
  const logos = [
    { name: 'LBank', src: '/logo/job/lbank.webp' },
    { name: 'dYdX', src: '/logo/job/dydx.webp', maxHeight: 20 },
    { name: 'Coinbase', src: '/logo/job/coinbase.webp' },
    { name: 'Bitget', src: '/logo/job/bitget.webp', maxHeight: 21 },
    { name: 'Binance', src: '/logo/job/binance.webp', maxHeight: 21 },
    { name: 'Circle', src: '/logo/companies/circle.png', maxHeight: 21 },
  ];

  return <LogoStrip title="Jobs from companies like:" logos={logos} />;
}
