'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { SITE_STATS } from '@/lib/constants';
import { trackCTAClick } from '@/lib/posthog';
import { cn } from '@/lib/utils';

export type CtaBannerVariant = 'hire' | 'jobs' | 'news' | 'community';

interface CtaBannerProps {
  variant?: CtaBannerVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  buttonText?: string;
  href?: string;
  className?: string;
  trackingAction?: string;
  children?: React.ReactNode;
}

const PRESET_CONFIG: Record<
  CtaBannerVariant,
  {
    title: string;
    description: string;
    buttonText: string;
    href: string;
    trackingAction: string;
  }
> = {
  hire: {
    title: 'Looking to Hire?',
    description: `Post your job on the #1 Web3 job board to reach over ${SITE_STATS.telegramSubscribersFormatted} qualified professionals.`,
    buttonText: 'Join Job Feed',
    href: 'https://t.me/web3jobs_rep',
    trackingAction: 'post_a_job',
  },
  jobs: {
    title: 'Find Your Next Web3 Job',
    description: `Join our Telegram channel with over ${SITE_STATS.telegramSubscribersFormatted} subscribers to get verified opportunities daily.`,
    buttonText: 'Join Job Feed',
    href: SITE_STATS.telegramUrl,
    trackingAction: 'join_job_feed',
  },
  news: {
    title: 'Stay Ahead of Web3 News',
    description: `Join over ${SITE_STATS.telegramNewsSubscribersFormatted} readers for instant breaking news, protocol updates, and industry insights.`,
    buttonText: 'Join News Feed',
    href: SITE_STATS.telegramNewsUrl,
    trackingAction: 'join_news_feed',
  },
  community: {
    title: 'Join the Global Builder Community',
    description: `Connect with thousands of blockchain developers, founders, and Web3 enthusiasts across Telegram.`,
    buttonText: 'Join Telegram',
    href: 'https://t.me/hashtagweb3',
    trackingAction: 'join_community',
  },
};

export function CtaBanner({
  variant = 'hire',
  title,
  description,
  buttonText,
  href,
  className,
  trackingAction,
  children,
}: CtaBannerProps) {
  const preset = PRESET_CONFIG[variant];
  const finalTitle = title ?? preset.title;
  const finalDescription = description ?? preset.description;
  const finalButtonText = buttonText ?? preset.buttonText;
  const finalHref = href ?? preset.href;
  const finalTrackingAction = trackingAction ?? preset.trackingAction;

  const handleClick = () => {
    trackCTAClick(finalTrackingAction, finalHref);
  };

  return (
    <Card className={cn('mt-12 site-container bg-muted/30 border shadow-none', className)}>
      <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">{finalTitle}</h3>
          <p className="text-muted-foreground text-sm md:text-base">{finalDescription}</p>
          {children}
        </div>
        <a
          href={finalHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="flex-shrink-0 mt-4 md:mt-0"
        >
          <Button size="lg">
            {finalButtonText} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
