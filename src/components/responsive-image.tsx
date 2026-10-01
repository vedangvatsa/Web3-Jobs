'use client';

import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react';
import type { ResponsiveImagePlan } from '@/lib/responsive-images';

type Props = ImgHTMLAttributes<HTMLImageElement> & { src: string; variants?: ResponsiveImagePlan };

export function ResponsiveImage({ src, variants, onError, width, height, ...props }: Props) {
  const [failedVariantFor, setFailedVariantFor] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const plan = failedVariantFor === src ? undefined : variants;
  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete || image.naturalWidth > 0) return;
    if (plan) setFailedVariantFor(src);
    else if (onError) image.dispatchEvent(new Event('error'));
  }, [src, plan, onError]);
  return (
    <picture className="contents">
      {plan?.avifSrcSet && <source type="image/avif" srcSet={plan.avifSrcSet} sizes={props.sizes} />}
      {plan?.webpSrcSet && <source type="image/webp" srcSet={plan.webpSrcSet} sizes={props.sizes} />}
      <img
        key={`${src}:${plan ? 'variant' : 'original'}`}
        ref={imageRef}
        {...props}
        src={plan?.src || src}
        srcSet={plan?.srcSet}
        width={width ?? plan?.width}
        height={height ?? plan?.height}
        decoding={props.decoding || 'async'}
        onError={event => {
          if (plan) setFailedVariantFor(src);
          else onError?.(event);
        }}
      />
    </picture>
  );
}
