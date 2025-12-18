"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

interface NewsletterComposerProps {
  onSuccess?: () => void;
}

export function NewsletterComposer({ onSuccess }: NewsletterComposerProps) {
  const [sending, setSending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      content: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSending(true);
    try {
      await api.post("/admin/newsletter/send", values);
      toast.success("Newsletter sent successfully!");
      form.reset();
      onSuccess?.();
    } catch (error: unknown) {
      console.error(error);
      toast.error((error as Error).message || "Failed to send newsletter");
    } finally {
      setSending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">Subject</FormLabel>
              <FormControl>
                <Input placeholder="Newsletter Subject" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black">
                Content (Markdown supported)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your update here..."
                  className="min-h-[300px] font-mono"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={sending}
          className="bg-[#ffe500] text-black hover:bg-[#ffe500]/90 w-full md:w-auto"
        >
          {sending ? (
            "Sending..."
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Send Newsletter
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
