import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Check if user is admin
    // For MVP/Demo: We'll allow access if email matches or checking the admins table
    // Ideally: check public.admins table.
    const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

    // FALLBACK FOR DEMO: If table is empty or specific email
    const isHardcodedAdmin = user.email === 'neverrwork@gmail.com';

    if (!admin && !isHardcodedAdmin) {
        // If not admin, redirect to dashboard or home
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
                <p>No tienes permisos de administrador.</p>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <AdminSidebar user={user} />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
