import Image from 'next/image';

export interface LogoItem {
  name: string;
  src: string;
  alt?: string;
  /** Cap rendered height so edge-to-edge wordmarks match padded logos optically. */
  maxHeight?: number;
  /** Scale image inside its cell (e.g. 1.25 for small wordmarks). */
  scale?: number;
}

export function LogoStrip({
  title,
  logos,
}: {
  title: string;
  logos: LogoItem[];
}) {
  return (
    <section className="pb-6">
      <div className="site-container">
        <div className="flex flex-col items-center">
          <h2 className="text-center text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
            {title}
          </h2>

          <div className="flow-root">
            <div className="-my-1 -mx-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {logos.map((logo) => {
                const maxHeight = logo.maxHeight ?? 28;
                return (
                  <div key={logo.name} className="flex items-center justify-center h-8 w-[100px]">
                    <Image
                      src={logo.src}
                    alt={logo.alt ?? `Logo of ${logo.name}`}
                    width={100}
                    height={maxHeight}
                    className="object-contain w-auto"
                    style={{ maxHeight }}
                    unoptimized={logo.src.toLowerCase().endsWith('.svg')}
                  />
                  <span className="sr-only">{logo.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
