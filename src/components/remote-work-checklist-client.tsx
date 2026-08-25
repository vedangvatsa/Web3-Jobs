'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Briefcase,
  Laptop,
  Users,
  BarChart,
  Shield,
  Heart,
  Download,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToolUsageTracker } from '@/components/tracking/tool-usage-tracker';
import { CtaBanner } from '@/components/cta-banner';
import { createPdfInstance } from '@/lib/pdf-utils';

const checklistData = {
  sections: [
    {
      title: 'Workspace Setup',
      icon: Briefcase,
      items: [
        'Ergonomic chair with lumbar support',
        'Spacious desk (enough for dual monitors)',
        'High-resolution main monitor (27-inch+ recommended)',
        'Secondary monitor for multitasking',
        'Laptop stand for eye-level screen alignment',
        'Noise-cancelling headphones or earphones',
        'High-quality external microphone',
        'Good lighting (ring light or natural source)',
        'Effective cable management system',
        'Uninterruptible Power Supply (UPS) for key devices',
        'Dedicated and quiet work area',
        'Ergonomic footrest for long sessions',
      ],
    },
    {
      title: 'Hardware & Software',
      icon: Laptop,
      items: [
        'Reliable laptop/desktop (16GB+ RAM min.)',
        'Operating system and drivers are fully updated',
        'Antivirus and anti-malware software is active',
        'Automated file and code backups are enabled',
        'VPN service installed and configured',
        'Cloud storage synced (Google Drive, Dropbox, IPFS)',
        'Web3 wallets updated (MetaMask, Phantom)',
        'Essential browser extensions installed',
      ],
    },
    {
      title: 'Communication & Collaboration',
      icon: Users,
      items: [
        'Slack/Discord accounts set up and notifications tested',
        'Zoom/Google Meet with working camera and mic',
        'Team calendar synced to your correct time zone',
        'Project management tools accessed (Asana, Notion)',
        'Git client configured (GitHub, GitLab)',
        'Team password manager access confirmed',
        'Time zone converter bookmarked',
        'Virtual whiteboard tools ready (Miro, FigJam)',
      ],
    },
    {
      title: 'Productivity & Workflow',
      icon: BarChart,
      items: [
        'Defined morning "start work" ritual',
        'Daily to-do list or task board updated',
        'Weekly goals reviewed every Monday morning',
        'Pomodoro timer or focus tool installed',
        'Clear "end of workday" shutdown routine',
        'Established priority-setting method (e.g., Eisenhower)',
        'Recurring check-ins scheduled with manager/team',
        '"Deep work" time blocks protected on calendar',
      ],
    },
    {
      title: 'Security & Privacy',
      icon: Shield,
      items: [
        'Two-Factor Authentication (2FA) enabled on all accounts',
        'Secure password manager in use (e.g., Bitwarden)',
        'Hardware wallet for storing crypto assets',
        'Encrypted messaging apps for sensitive comms (Signal)',
        'Work devices kept separate from personal devices',
        'On-chain reputation managed (ENS, public wallet activity)',
        'Regularly revoke unnecessary smart contract approvals',
        'Physical security for devices (laptop lock)',
      ],
    },
    {
      title: 'Health & Wellbeing',
      icon: Heart,
      items: [
        'Practice regular eye breaks (20-20-20 rule)',
        'Standing desk or desk converter for posture',
        'Scheduled stretching or mobility exercises',
        'System for staying hydrated (e.g., marked water bottle)',
        'Blue light filtering glasses or screen settings',
        'Scheduled lunch and snack breaks away from desk',
        'Clear boundaries for work/personal time',
        'Ergonomic mouse and keyboard setup',
      ],
    },
  ],
};

function ChecklistItem({ id, label }: { id: string; label: string }) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg transition-colors hover:bg-secondary/50">
      <Checkbox id={id} />
      <Label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        {label}
      </Label>
    </div>
  );
}

export function RemoteWorkChecklistClient() {
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    try {
      const { doc, margin, pageWidth, pageHeight } = await createPdfInstance();
      let y = margin;

      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 106, 187);
      doc.text('Remote Work Readiness Checklist', pageWidth / 2, y, { align: 'center' });
      y += 20;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(
        'A guide to optimizing your setup for productivity, security, and well-being in a Web3 career.',
        pageWidth / 2,
        y,
        { align: 'center' }
      );
      y += 40;

      checklistData.sections.forEach((section) => {
        if (y > pageHeight - 100) {
          doc.addPage();
          y = margin;
        }
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(29, 40, 58);
        doc.text(section.title, margin, y);
        y += 25;

        section.items.forEach((item) => {
          if (y > pageHeight - 30) {
            doc.addPage();
            y = margin;
          }
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.setDrawColor(200);
          doc.rect(margin, y - 8, 12, 12);
          doc.text(item, margin + 25, y);
          y += 22;
        });
        y += 15;
      });

      const footerY = pageHeight - 20;
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Find Web3 Jobs: t.me/web3hiring', pageWidth / 2, footerY, { align: 'center' });

      doc.save('Remote_Work_Checklist_Web3_Edition.pdf');
      toast({
        title: 'Success!',
        description: 'Your checklist has been downloaded.',
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'There was a problem generating the PDF.',
      });
    }
  };

  return (
    <div className="site-container space-y-8">
      <ToolUsageTracker toolName="Remote Work Checklist" />
      <section className="text-center mb-12 site-container">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
          Remote Work Readiness Checklist
        </h1>
        <Button onClick={handleDownloadPdf} className="mt-6">
          <Download className="mr-2 h-4 w-4" />
          Download as PDF
        </Button>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {checklistData.sections.map((section, sectionIndex) => (
          <Card key={section.title} className="flex flex-col">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                {section.items.map((item, itemIndex) => (
                  <ChecklistItem
                    key={itemIndex}
                    id={`item-${sectionIndex}-${itemIndex}`}
                    label={item}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CtaBanner
        variant="jobs"
        title="Looking for a Web3 Job?"
        className="col-span-full"
      />
    </div>
  );
}
