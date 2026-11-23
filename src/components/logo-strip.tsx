import { ResponsiveImage } from './responsive-image';
import { getImageVariants } from '@/lib/responsive-images-server';
import { cn } from '@/lib/utils';

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
  className,
}: {
  title: string;
  logos: LogoItem[];
  className?: string;
}) {
  return (
    <section className={cn('pb-6', className)}>
      <div className="site-container">
        <div className="flex flex-col items-center">
          <h2 className="text-center text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
            {title}
          </h2>

          <div className="flow-root">
            <div className="-my-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 sm:gap-x-5 md:gap-x-5 lg:gap-x-8">
              {logos.map((logo) => {
                const maxHeight = logo.maxHeight ?? 24;
                return (
                  <div key={logo.name} className="flex items-center justify-center h-8 px-1">
                    <ResponsiveImage
                      src={logo.src}
                      variants={getImageVariants(logo.src)}
                      sizes="120px"
                      alt={logo.alt ?? `Logo of ${logo.name}`}
                      width={120}
                      height={maxHeight}
                      className="object-contain w-auto"
                      style={{ maxHeight }}
                      loading="lazy"
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
