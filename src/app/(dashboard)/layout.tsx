import { Sidebar } from "@/components/sidebar";
import { TopHeader } from "@/components/top-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pt-14 md:pt-0 md:pl-64">
        <TopHeader />
        <main className="flex-1 p-4 pt-4 md:p-6 md:pt-6">{children}</main>
      </div>
    </div>
  );
}
