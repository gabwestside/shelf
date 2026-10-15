import React from "react";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/top-bar";
import { FooterBar } from "@/components/layout/footer-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-[#050811] text-slate-100">
      <TopBar user={user} />
      <main className="flex-1 flex flex-col">{children}</main>
      <FooterBar />
    </div>
  );
}
