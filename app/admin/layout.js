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
        });
    } catch (error) {
        console.log("ADMIN_SESSION_ERROR:", error);
        redirect("/login");
    }

    if (!session?.user) redirect("/login");

    if (session.user.role !== "admin") redirect("/");

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <div className="flex flex-col lg:flex-row">
                <AdminSidebar />

                <main className="w-full px-4 py-6 lg:px-10 lg:py-8">
                    {children}
                </main>
            </div>
        </div>
    );
}