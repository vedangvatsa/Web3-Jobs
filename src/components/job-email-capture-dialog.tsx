'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/types';
import { ArrowRight, Rss } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { saveEmail } from '@/lib/db';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface JobEmailCaptureDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobEmailCaptureDialog({
  job,
  open,
  onOpenChange,
}: JobEmailCaptureDialogProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = (data: EmailFormData) => {
    if (firestore) {
      saveEmail(firestore, data.email);
    }

    toast({
      title: 'Email Submitted!',
      description: `You will now be redirected to the job posting.`,
    });

    if (job?.link) {
      window.open(job.link, '_blank');
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Continue to Job Application</DialogTitle>
          <DialogDescription>
            You are applying for{' '}
            <span className="font-semibold text-primary">{job?.title}</span> at{' '}
            <span className="font-semibold text-primary">{job?.company}</span>.
            Enter your email to receive relevant job alerts and continue.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Continue to Job <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
        <DialogFooter className="pt-4 mt-4 border-t items-center text-center">
          <div className="text-sm text-muted-foreground w-full">
            <p>Or get instant job alerts on Telegram!</p>
            <a
              href="https://t.me/web3hiring"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button variant="outline" className="w-full mt-2">
                <Rss className="mr-2 h-4 w-4" />
                Join 60,000+ on Telegram
              </Button>
            </a>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
