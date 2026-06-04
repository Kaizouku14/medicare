"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully.");
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      onClick={onLogout}
      disabled={loading}
      size="sm"
      className="h-8 gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      {loading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <LogOut className="size-3.5" />
      )}
      {loading ? "Logging out..." : "Logout"}
    </Button>
  );
}
