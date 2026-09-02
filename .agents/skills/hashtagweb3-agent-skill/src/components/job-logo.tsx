'use client';

interface JobLogoProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}

export function JobLogo({ src, fallbackSrc, alt, className }: JobLogoProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.src = fallbackSrc;
      }}
    />
  );
}
