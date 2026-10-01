import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { UserCircle, KeyRound, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "My Profile — FreshMart ERP" },
      { name: "description", content: "Manage your personal details and account password." },
    ],
  }),
});

function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [changingPw, setChangingPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  const validateProfile = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e["fullName"] = "Full name is required.";
    else if (fullName.trim().length > 100) e["fullName"] = "Name must be under 100 characters.";
    if (phone.trim() && !/^\+?[\d\s()-]{7,15}$/.test(phone.trim()))
      e["phone"] = "Enter a valid phone number (7–15 digits).";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePassword = () => {
    const e: Record<string, string> = {};
    if (pw.password.length < 8) e["password"] = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(pw.password) || !/[a-z]/.test(pw.password) || !/\d/.test(pw.password))
      e["password"] = "Use upper & lower case letters and a number.";
    if (pw.confirm !== pw.password) e["confirm"] = "Passwords do not match.";
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) toast.error("Could not load your profile.");
        setFullName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
        setLoading(false);
      });
  }, [user]);

  const initials = (fullName?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!validateProfile()) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName.trim(), phone: phone.trim() || null, email: user.email ?? null });
    setSaving(false);
    if (error) toast.error("Could not save your profile.");
    else toast.success("Profile updated.");
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: pw.password });
    setChangingPw(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password changed successfully.");
      setPw({ password: "", confirm: "" });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal details and sign-in security.</p>
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex-row items-center gap-4 space-y-0">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-xl font-bold text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{fullName || "Your account"}</CardTitle>
            <CardDescription>{user?.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full name <span className="text-destructive">*</span></label>
                <Input
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }}
                  placeholder="Your name"
                  maxLength={100}
                  className={errors["fullName"] ? "border-destructive" : ""}
                />
                {errors["fullName"] && <p className="text-xs text-destructive">{errors["fullName"]}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                  placeholder="+91 98765 43210"
                  maxLength={16}
                  className={errors["phone"] ? "border-destructive" : ""}
                />
                {errors["phone"] && <p className="text-xs text-destructive">{errors["phone"]}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input value={user?.email ?? ""} disabled />
                <p className="text-xs text-muted-foreground">Email is your sign-in identity and cannot be changed here.</p>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Change password
          </CardTitle>
          <CardDescription>Use a strong password you don't reuse elsewhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">New password</label>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={pw.password}
                  onChange={(e) => { setPw({ ...pw, password: e.target.value }); setPwErrors((p) => ({ ...p, password: "" })); }}
                  className={pwErrors["password"] ? "border-destructive" : ""}
                />
                {pwErrors["password"] && <p className="text-xs text-destructive">{pwErrors["password"]}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm password</label>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={pw.confirm}
                  onChange={(e) => { setPw({ ...pw, confirm: e.target.value }); setPwErrors((p) => ({ ...p, confirm: "" })); }}
                  className={pwErrors["confirm"] ? "border-destructive" : ""}
                />
                {pwErrors["confirm"] && <p className="text-xs text-destructive">{pwErrors["confirm"]}</p>}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-xs text-muted-foreground">
                <UserCircle className="h-4 w-4" />
                Signed in as {user?.email}
              </p>
              <Button type="submit" variant="outline" disabled={changingPw}>
                {changingPw ? "Updating..." : "Update password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
