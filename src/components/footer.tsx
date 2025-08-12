
import { Instagram, Linkedin, Mail, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Hashtag Web3
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The best place for top talent to discover exclusive opportunities at leading Web3 companies.
            </p>
          </div>
          
          <div className="flex items-center justify-start md:justify-end">
            <div className="flex gap-5">
              <a href="https://linkedin.com/company/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Follow us on LinkedIn">
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="https://x.com/hashtag_web3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Follow us on X">
                <Twitter size={20} />
                <span className="sr-only">X (formerly Twitter)</span>
              </a>
              <a href="https://instagram.com/hashtagweb3" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Follow us on Instagram">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
               <a href="mailto:hi@hashtagweb3.com" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Email us">
                <Mail size={20} />
                <span className="sr-only">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
