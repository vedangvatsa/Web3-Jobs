import Image from 'next/image';

export function EventPartners() {
  const logos = [
    { name: 'TOKEN2049', src: '/logo/partners/token2049.png' },
    { name: 'Taipei Blockchain Week', src: '/logo/partners/taipeiblockchainweek.png' },
    { name: 'EDCON', src: '/logo/partners/edcon.png' },
    { name: 'ETHVietnam', src: '/logo/partners/ethvietnam.png' },
    { name: 'ETHBrussels', src: '/logo/partners/ethbrussels.png' },
    { name: 'ETH Oxford', src: '/logo/partners/ETHOxford.png' },
    { name: 'Coinfest Asia', src: '/logo/partners/coinfest.png' },
    { name: 'Malaysia Blockchain Week', src: '/logo/partners/malaysiablockchainweek.png' },
    { name: 'Istanbul Blockchain Week', src: '/logo/partners/istanbul.png' },
  ];

  return (
    <section className="pb-6">
      <div className="site-container px-4">
        <div className="flex flex-col items-center">
          <h2 className="text-center text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
            We partnered with events like:
          </h2>

          <div className="flow-root">
            <div className="-my-1 -mx-3 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {logos.map((logo) => (
                <div key={logo.name} className="flex items-center justify-center h-8 w-[110px]">
                  <Image
                    src={logo.src}
                    alt={`Logo of ${logo.name}`}
                    width={110}
                    height={28}
                    className="object-contain max-h-7 opacity-85 hover:opacity-100 transition-opacity"
                    unoptimized
                  />
                  <span className="sr-only">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
