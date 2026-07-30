import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/login?redirect=/admin");
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="section-px mx-auto grid max-w-7xl grid-cols-1 gap-8 py-10 lg:grid-cols-[220px_1fr]">
        <AdminNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
