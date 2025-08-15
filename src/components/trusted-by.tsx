
import Image from 'next/image';

export function TrustedBy() {
    const logos = [
        { name: 'LBank', src: '/logo/job/lbank.png' },
        { name: 'dYdX', src: '/logo/job/dydx.png' },
        { name: 'Coinbase', src: '/logo/job/coinbase.png' },
        { name: 'Bitget', src: '/logo/job/bitget.png' },
        { name: 'Binance', src: '/logo/job/binance.png' },
        { name: 'Circle', src: '/logo/job/circle.png' },
    ];

    return (
        <section className="pb-6">
            <div className="mx-auto max-w-4xl px-4">
                <div className="flex flex-col items-center">
                    <h2 className="text-center text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
                        Jobs from companies like:
                    </h2>

                    <div className="flow-root">
                        <div className="-my-1 -mx-3 flex flex-wrap items-center justify-center">
                            {logos.map((logo) => (
                                <div key={logo.name} className="p-2">
                                    <div className="relative h-6 w-32">
                                        <Image 
                                          src={logo.src}
                                          alt={`${logo.name} logo`}
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
