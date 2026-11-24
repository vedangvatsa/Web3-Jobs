/** Visible context for crawlers and readers: editorial news, not an operator or scam portal. */
export function NewsEditorialNotice() {
  return (
    <p className="mb-8 rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
      <strong className="font-medium text-foreground">Editorial news report.</strong> Hashtag Web3 does not
      operate the companies, protocols, or scam networks described below. This page summarizes public filings and
      third-party reporting; it is not a request for passwords, seed phrases, wallet signatures, or payments.
    </p>
  );
}