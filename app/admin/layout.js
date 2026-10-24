import AdminSidebar from "../../components/AdminSidebar";
import { auth } from "../../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }) {
  let session = null;

  try {
    session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
  } catch (error) {
    console.error("ADMIN_SESSION_ERROR", error.name);
    throw new Error(
      "We could not check your session. Please retry; you have not been signed out.",
    );
  }

  if (!session?.user) redirect("/login?callbackURL=%2Fadmin");

  if (session.user.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar />

        <main className="min-w-0 w-full flex-1 px-4 py-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
