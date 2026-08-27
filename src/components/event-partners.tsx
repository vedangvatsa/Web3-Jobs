import { LogoStrip } from '@/components/logo-strip';

export function EventPartners() {
  const logos = [
    { name: 'TOKEN2049', src: '/logo/partners/token2049.png' },
    { name: 'Harvard Blockchain', src: '/logo/partners/harvard.png' },
    { name: 'ETH Oxford', src: '/logo/partners/ETHOxford.png' },
    { name: 'Taipei Blockchain Week', src: '/logo/partners/taipeiblockchainweek.png' },
    { name: 'ETHBrussels', src: '/logo/partners/ethbrussels.png' },
    { name: 'IEEE Entrepreneurship', src: '/logo/partners/ieee.png' },
  ];

  return <LogoStrip title="We partnered with events like:" logos={logos} />;
}
