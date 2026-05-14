import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/layout/sign-out-button";

export const Topbar = async () => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <h1 className="text-xl font-semibold">Family Finance Hub</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-white px-4 py-2 text-sm shadow-soft">{data.user?.email ?? "Guest"}</div>
        <SignOutButton />
      </div>
    </header>
  );
};
