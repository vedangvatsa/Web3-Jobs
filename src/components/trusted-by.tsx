
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
        <section className="py-12 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center">
                    <h2 className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                        Promoting open roles from top companies like
                    </h2>

                    <div className="mt-8 flow-root">
                        <div className="-my-2 -mx-4 flex flex-wrap items-center justify-center sm:-mx-6 lg:-mx-8">
                            {logos.map((logo) => (
                                <div key={logo.name} className="py-4 px-6 sm:px-6 lg:px-8">
                                    <Image 
                                      src={logo.src}
                                      alt={logo.name} 
                                      width={130} 
                                      height={32}
                                      className="h-8 w-auto transition-opacity opacity-60 hover:opacity-100"
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
