
import { Button } from '@/components/ui/button';

export function Header() {
    return (
        <header className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                    Hashtag Web3
                </h1>
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <a href="/articles" className="text-muted-foreground transition-colors hover:text-foreground">Articles</a>
                    <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">Feed</a>
                    <a href="https://t.me/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">Discuss</a>
                    <a href="https://academy.hashtagweb3.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">Academy</a>
                    <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
                        <Button>Post a Job</Button>
                    </a>
                </nav>
            </div>
      </header>
    )
}
