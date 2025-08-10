
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Link from 'next/link';

export function Header() {
    const navLinks = [
        { href: "/articles", label: "Articles" },
        { href: "https://t.me/web3hiring", label: "Feed", target: "_blank" },
        { href: "https://t.me/hashtagweb3", label: "Discuss", target: "_blank" },
        { href: "https://academy.hashtagweb3.com/", label: "Academy", target: "_blank" },
    ];

    return (
        <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-20 items-center justify-between px-4">
                <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
                    Hashtag Web3
                </Link>
                
                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navLinks.map((link) => (
                        <a key={link.label} href={link.href} target={link.target} rel={link.target ? "noopener noreferrer" : undefined} className="text-muted-foreground transition-colors hover:text-foreground">
                            {link.label}
                        </a>
                    ))}
                    <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
                        <Button>Post a Job</Button>
                    </a>
                </nav>

                {/* Mobile Navigation */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <div className="grid gap-4 py-6">
                                <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
                                    Hashtag Web3
                                </Link>
                                {navLinks.map((link) => (
                                    <a key={link.label} href={link.href} target={link.target} rel={link.target ? "noopener noreferrer" : undefined} className="text-muted-foreground transition-colors hover:text-foreground">
                                        {link.label}
                                    </a>
                                ))}
                                <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
                                    <Button className="w-full">Post a Job</Button>
                                </a>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
      </header>
    )
}
