import Image from 'next/image';

export interface LogoItem {
  name: string;
  src: string;
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
      <div className="site-container px-4">
        <div className="flex flex-col items-center">
          <h2 className="text-center text-xs font-semibold text-muted-foreground tracking-wider uppercase mb-3">
            {title}
          </h2>

          <div className="flow-root">
            <div className="-my-1 -mx-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {logos.map((logo) => (
                <div key={logo.name} className="flex items-center justify-center h-8 w-[100px]">
                  <Image
                    src={logo.src}
                    alt={`Logo of ${logo.name}`}
                    width={100}
                    height={28}
                    className="object-contain max-h-7"
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
