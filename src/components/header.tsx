
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Linkedin, Twitter, Rss, MessageSquare, GraduationCap, X } from 'lucide-react';
import Link from 'next/link';

export function Header() {
    const navLinks = [
        { href: "https://t.me/web3hiring", label: "Feed", target: "_blank", icon: Rss },
        { href: "https://t.me/hashtagweb3", label: "Discuss", target: "_blank", icon: MessageSquare },
        { href: "https://academy.hashtagweb3.com/", label: "Academy", target: "_blank", icon: GraduationCap },
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
                        <SheetContent side="right" className="w-[300px] flex flex-col bg-card p-0">
                           <div className="p-6 flex items-center justify-between border-b">
                                <Link href="/" className="text-lg font-bold tracking-tight text-foreground" aria-label="Hashtag Web3 Homepage">
                                    Hashtag Web3
                                </Link>
                                <SheetClose>
                                    <X className="h-6 w-6 text-muted-foreground" />
                                    <span className="sr-only">Close</span>
                                </SheetClose>
                            </div>
                            <nav className="flex-grow flex flex-col p-4">
                                <div className="flex-grow space-y-2">
                                {navLinks.map((link) => (
                                    <SheetClose key={link.label} asChild>
                                        <a href={link.href} target={link.target} rel={link.target ? "noopener noreferrer" : undefined} className="flex items-center gap-4 p-3 rounded-lg text-base font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                                            <link.icon className="h-5 w-5" />
                                            <span>{link.label}</span>
                                        </a>
                                    </SheetClose>
                                ))}
                                </div>
                            </nav>
                             <div className="mt-auto p-6 border-t space-y-4">
                                <a href="https://t.me/web3jobs_rep" target="_blank" rel="noopener noreferrer" className="w-full">
                                    <Button className="w-full text-base h-11">Post a Job</Button>
                                </a>
                                <div className="flex items-center justify-center gap-6 pt-2">
                                     {socialLinks.map((link) => (
                                        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label={link['aria-label']}>
                                            <link.icon size={22} />
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
