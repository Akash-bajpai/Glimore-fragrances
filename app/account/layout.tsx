import { getCurrentUser } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="section-px mx-auto max-w-6xl py-16 sm:py-24">
      <div className="mb-10">
        <span className="eyebrow">My Account</span>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">
          Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}
