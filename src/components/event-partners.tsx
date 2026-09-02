import { LogoStrip } from '@/components/logo-strip';

export function EventPartners() {
  const logos = [
    { name: 'TOKEN2049', src: '/logo/partners/token2049.webp' },
    { name: 'Harvard Blockchain', src: '/logo/partners/harvard.webp' },
    { name: 'ETH Oxford', src: '/logo/partners/ETHOxford.webp' },
    { name: 'Taipei Blockchain Week', src: '/logo/partners/taipeiblockchainweek.webp' },
    { name: 'ETHBrussels', src: '/logo/partners/ethbrussels.webp' },
    { name: 'IEEE Entrepreneurship', src: '/logo/partners/ieee.webp' },
  ];

  return <LogoStrip title="We partnered with events like:" logos={logos} />;
}
