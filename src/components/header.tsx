
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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
                <Link href="/" className="text-xl font-bold tracking-tight text-foreground" aria-label="Hashtag Web3 Homepage">
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Toggle navigation menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            {navLinks.map((link) => (
                                <DropdownMenuItem key={link.label} asChild>
                                    <a href={link.href} target={link.target} rel={link.target ? "noopener noreferrer" : undefined}>
                                        {link.label}
                                    </a>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                             <DropdownMenuItem asChild>
                                <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer">
                                    <Button className="w-full">Post a Job</Button>
                                </a>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
      </header>
    )
}
