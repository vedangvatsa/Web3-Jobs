"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Check, Copy } from "lucide-react";

const TOPIC_CONFIG: Record<
  string,
  { label: string; email: string; subjectPrefix: string; defaultBody: string }
> = {
  partnership: {
    label: "Event or Media Partnership",
    email: "contact@hashtagweb3.com",
    subjectPrefix: "Partnership Inquiry",
    defaultBody: "Hi Alex,\n\nWe would like to explore an official partnership for our upcoming event:\n\nEvent Name:\nEvent Dates:\nWebsite:\nExpected Attendees:\n\nLooking forward to coordinating.",
  },
  hiring: {
    label: "Employer / Job Posting",
    email: "contact@hashtagweb3.com",
    subjectPrefix: "Hiring Inquiry",
    defaultBody: "Hi Hashtag Web3 Team,\n\nWe are looking to hire Web3 talent for the following role(s):\n\nCompany Name:\nOpen Position(s):\nLocation (Remote / City):\nBudget / Timeline:\n\nPlease share your employer distribution packages.",
  },
  developer: {
    label: "Developer / API Support",
    email: "dev@hashtagweb3.com",
    subjectPrefix: "API & MCP Support",
    defaultBody: "Hi Dev Team,\n\nI have a technical question regarding the Hashtag Web3 API / MCP endpoints:\n\nIntegration Type:\nEndpoint / Issue:\n\nThanks,",
  },
  general: {
    label: "General Inquiry / Press",
    email: "contact@hashtagweb3.com",
    subjectPrefix: "General Inquiry",
    defaultBody: "Hi Hashtag Web3 Team,\n\nI am writing to inquire about:\n\n",
  },
};

export function ContactForm() {
  const [topic, setTopic] = React.useState<string>("partnership");
  const [name, setName] = React.useState("");
  const [senderEmail, setSenderEmail] = React.useState("");
  const [organization, setOrganization] = React.useState("");
  const [message, setMessage] = React.useState(TOPIC_CONFIG.partnership.defaultBody);
  const [copied, setCopied] = React.useState(false);

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    const config = TOPIC_CONFIG[newTopic];
    if (config) {
      setMessage(config.defaultBody);
    }
  };

  const selectedConfig = TOPIC_CONFIG[topic] || TOPIC_CONFIG.partnership;
  const targetEmail = selectedConfig.email;

  const composeSubject = () => {
    const orgPart = organization ? ` - ${organization}` : "";
    const namePart = name ? ` (${name})` : "";
    return `${selectedConfig.subjectPrefix}${orgPart}${namePart}`;
  };

  const composeFullBody = () => {
    const headerLines = [];
    if (name) headerLines.push(`From: ${name}`);
    if (senderEmail) headerLines.push(`Email: ${senderEmail}`);
    if (organization) headerLines.push(`Organization: ${organization}`);
    const header = headerLines.length > 0 ? `${headerLines.join("\n")}\n\n` : "";
    return `${header}${message}`;
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(composeSubject());
    const body = encodeURIComponent(composeFullBody());
    window.location.href = `mailto:${targetEmail}?subject=${subject}&body=${body}`;
  };

  const handleCopyMessage = async () => {
    const fullText = `To: ${targetEmail}\nSubject: ${composeSubject()}\n\n${composeFullBody()}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Send Direct Message
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Select your topic to direct your message to the appropriate team lead.
            </CardDescription>
          </div>
          <div className="text-xs font-mono px-2.5 py-1 rounded-md bg-muted text-muted-foreground border shrink-0">
            Routing: {targetEmail}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="inquiry-topic">Inquiry Type</Label>
            <Select value={topic} onValueChange={handleTopicChange}>
              <SelectTrigger id="inquiry-topic">
                <SelectValue placeholder="Select topic" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TOPIC_CONFIG).map(([key, item]) => (
                  <SelectItem key={key} value={key}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contact-name">Your Name</Label>
              <Input
                id="contact-name"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-email">Your Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="alex@protocol.xyz"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-org">Project, Company, or Event Name (Optional)</Label>
            <Input
              id="contact-org"
              placeholder="e.g. Korea Blockchain Week, Monad, etc."
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contact-message">Message Details</Label>
            <Textarea
              id="contact-message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="font-sans text-sm resize-y"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <Button
              type="submit"
              size="lg"
              className="gap-2 w-full sm:w-auto"
            >
              <Mail className="h-4 w-4" />
              <span>Open Email Client</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyMessage}
                className="gap-1.5 text-xs w-full sm:w-auto"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    <span>Copied Message</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </Button>
              <a
                href="https://t.me/web3jobs_rep"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-1.5 text-xs w-full sm:w-auto"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Telegram Instead</span>
                </Button>
              </a>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
