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
import type { Job } from '@/types';
import { ArrowRight, Send } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { saveEmail } from '@/lib/db';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

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
  const firestore = useFirestore();
  const { toast } = useToast();
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

  const onSubmit = async (data: EmailFormData) => {
    if (!firestore) {
      toast({
        variant: "destructive",
        title: "Database Not Configured",
        description: "The application is not connected to a database. Your email could not be saved. This is likely because the Firebase environment variables are not set correctly.",
      });
      console.error("Firestore instance is null. Firebase may not be configured correctly.");
      onOpenChange(false);
      return;
    }
    
    try {
      await saveEmail(firestore, data.email);
      toast({
          title: "Success!",
          description: "You're subscribed. We'll keep you updated on the latest jobs.",
      });

      if (job?.link) {
        window.open(job.link, '_blank');
      }
      onOpenChange(false);

    } catch (error: any) {
      // The permission-denied error is handled by the global error listener via errorEmitter,
      // so we only need to toast for other types of errors.
      if (error.code !== 'permission-denied' && error.code !== 'PERMISSION_DENIED') {
          toast({
              variant: "destructive",
              title: "Submission Error",
              description: `Could not save your email. Reason: ${error.message || 'An unknown error occurred.'}`,
          });
      }
    }
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
        <Separator className="my-2" />
        <div className="text-center space-y-2 pt-2">
            <p className="text-sm text-muted-foreground px-4">
                Join 60,000+ subscribers on our Telegram channel for the latest job postings.
            </p>
            <a href="https://t.me/web3hiring" target="_blank" rel="noopener noreferrer" className="w-full inline-block px-4">
                <Button variant="outline" className="w-full">
                    <Send className="mr-2 h-4 w-4" /> Join Telegram Feed
                </Button>
            </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
