
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Header() {
    const navLinks = [
        { href: "https://t.me/web3hiring", label: "Feed", target: "_blank" },
        { href: "https://t.me/hashtagweb3", label: "Discuss", target: "_blank" },
        { href: "https://academy.hashtagweb3.com/", label: "Academy", target: "_blank" },
    ];

    const socialLinks = [
        { href: "https://x.com/hashtag_web3", label: "X", icon: Twitter, 'aria-label': 'Follow us on X' },
        { href: "https://linkedin.com/company/hashtagweb3", label: "LinkedIn", icon: Linkedin, 'aria-label': 'Follow us on LinkedIn' },
    ]

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
                    <div className="flex items-center gap-4">
                         {socialLinks.map((link) => (
                            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label={link['aria-label']}>
                                <link.icon size={20} />
                                <span className="sr-only">{link.label}</span>
                            </a>
                        ))}
                    </div>
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
                        <SheetContent side="right" className="w-[300px] flex flex-col">
                            <div className="p-6">
                                <Link href="/" className="text-xl font-bold tracking-tight text-foreground" aria-label="Hashtag Web3 Homepage">
                                    Hashtag Web3
                                </Link>
                            </div>
                            <nav className="flex-grow flex flex-col gap-4 px-6 text-lg font-medium">
                                {navLinks.map((link) => (
                                    <SheetClose key={link.label} asChild>
                                        <a href={link.href} target={link.target} rel={link.target ? "noopener noreferrer" : undefined} className="text-muted-foreground transition-colors hover:text-foreground">
                                            {link.label}
                                        </a>
                                    </SheetClose>
                                ))}
                            </nav>
                             <div className="mt-auto p-6 border-t">
                                <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="w-full">
                                    <Button className="w-full text-lg h-12">Post a Job</Button>
                                </a>
                                <div className="flex items-center justify-center gap-6 mt-6">
                                     {socialLinks.map((link) => (
                                        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label={link['aria-label']}>
                                            <link.icon size={24} />
                                            <span className="sr-only">{link.label}</span>
                                        </a>
                                    ))}
                                </div>
                             </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
      </header>
    )
}
