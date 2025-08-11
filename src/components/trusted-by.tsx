
import Image from 'next/image';

export function TrustedBy() {
    return (
        <section className="py-12 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center">
                    <h2 className="text-center text-sm font-semibold text-muted-foreground tracking-wider uppercase">
                        Trusted by leading web3 startups and companies
                    </h2>

                    <div className="mt-8 flow-root">
                        <div className="-my-2 -mx-4 flex flex-wrap items-center justify-center sm:-mx-6 lg:-mx-8">
                            <div className="py-4 px-6 sm:px-6 lg:px-8">
                                <Image 
                                  src="/logo/coinbase.png" 
                                  alt="Coinbase" 
                                  width={110} 
                                  height={28}
                                  className="h-7 w-auto transition-opacity opacity-60 hover:opacity-100"
                                  unoptimized
                                />
                                <span className="sr-only">Coinbase</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
