import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, ShoppingBag } from "lucide-react";

const requestSchema = z.object({ email: z.string().email("Enter a valid email") });
const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RequestValues = z.infer<typeof requestSchema>;
type ResetValues = z.infer<typeof resetSchema>;

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset password — FreshMart ERP" },
      { name: "description", content: "Securely reset the password for your FreshMart account." },
      { property: "og:title", content: "Reset password — FreshMart ERP" },
      { property: "og:description", content: "Recover access to your FreshMart retail management account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ResetPasswordPage() {
  const router = useRouter();
  const [hash, setHash] = useState<Record<string, string> | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace("#", ""));
    const entries: Record<string, string> = {};
    params.forEach((value, key) => {
      entries[key] = value;
    });
    setHash(entries);
  }, []);

  const requestForm = useForm<RequestValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "" },
  });

  const onRequest = async (values: RequestValues) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSubmitting(false);
    if (error) {
      requestForm.setError("root", { message: error.message });
      return;
    }
    setEmailSent(true);
  };

  const onReset = async (values: ResetValues) => {
    if (hash?.['type'] !== "recovery") {
      resetForm.setError("root", { message: "Invalid or expired recovery link." });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    setIsSubmitting(false);
    if (error) {
      resetForm.setError("root", { message: error.message });
      return;
    }
    setResetDone(true);
    setTimeout(() => router.navigate({ to: "/auth", replace: true }), 2000);
  };

  const isRecovery = hash?.['type'] === "recovery";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-6 flex items-center gap-2 text-primary">
        <ShoppingBag className="h-8 w-8" />
        <span className="text-2xl font-bold tracking-tight">FreshMart</span>
      </div>
      <Card className="w-full max-w-md shadow-panel">
        <CardHeader>
          <CardTitle>{isRecovery ? "Set new password" : "Reset password"}</CardTitle>
          <CardDescription>
            {isRecovery
              ? "Enter your new password below."
              : "We'll send a password reset link to your email."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetDone ? (
            <p className="text-center text-sm text-muted-foreground">
              Password updated. Redirecting you to sign in...
            </p>
          ) : isRecovery ? (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                <FormField
                  control={resetForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {resetForm.formState.errors.root && (
                  <p className="text-sm text-destructive">{resetForm.formState.errors.root.message}</p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update password
                </Button>
              </form>
            </Form>
          ) : emailSent ? (
            <p className="text-center text-sm text-muted-foreground">
              Check your inbox for the reset link.
            </p>
          ) : (
            <Form {...requestForm}>
              <form onSubmit={requestForm.handleSubmit(onRequest)} className="space-y-4">
                <FormField
                  control={requestForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@store.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {requestForm.formState.errors.root && (
                  <p className="text-sm text-destructive">{requestForm.formState.errors.root.message}</p>
                )}
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <Link to="/auth" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
