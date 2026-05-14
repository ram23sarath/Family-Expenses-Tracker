import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getSessionContext } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await getSessionContext();

  return (
    <div className="md:flex md:min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <Topbar />
        {children}
      </main>
    </div>
  );
}
