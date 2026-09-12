import { Button } from '@/components/ui/button';

export function PostJobNavCta() {
  return (
    <a className="post-job-nav-cta" href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
      <Button size="sm" variant="default" className="shadow-sm font-semibold">
        Post a Job
      </Button>
    </a>
  );
}
