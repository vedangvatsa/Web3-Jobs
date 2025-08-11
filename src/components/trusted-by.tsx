
import Image from 'next/image';

export function TrustedBy() {
    const logos = [
        { name: 'Coinbase', src: '/logo/coinbase.png' },
        { name: 'Bitget', src: '/logo/bitget.png' },
        { name: 'Binance', src: '/logo/binance.png' },
        { name: 'LBank', src: '/logo/lbank.png' },
        { name: 'dYdX', src: '/logo/dydx.png' },
        { name: 'Glassnode', src: '/logo/glassnode.png' },
    ];

    return (
        <section className="pb-8">
            <div className="mx-auto px-4">
                <div className="flex flex-col items-center">
                    <h2 className="text-center text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                        Jobs from companies like:
                    </h2>

                    <div className="mt-4 flow-root">
                        <div className="-my-1 -mx-3 flex flex-wrap items-center justify-center">
                            {logos.map((logo) => (
                                <div key={logo.name} className="p-2">
                                    <div className="relative h-6 w-24">
                                        <Image 
                                          src={logo.src}
                                          alt={logo.name} 
                                          fill
                                          className="object-contain"
                                          unoptimized
                                        />
                                    </div>
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
