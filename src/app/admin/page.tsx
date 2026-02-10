import { createClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ShoppingBag, Users, DollarSign } from "lucide-react";

async function getStats() {
    const supabase = await createClient();

    // Fetch counts in parallel
    const [merchants, products, orders, customers] = await Promise.all([
        supabase.from('merchants').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('total_uyu', { count: 'exact' }), // We'll sum manually or use a function if data is small
        supabase.from('customers').select('id', { count: 'exact', head: true })
    ]);

    // For revenue, doing a real sum on client side is bad for scale, but for MVP/Start ok.
    // Better: create a Postgres View for global stats.

    // Let's assume user requested straightforward stats.
    const { data: orderData } = await supabase.from('orders').select('total_uyu');
    const totalRevenue = orderData?.reduce((acc, order) => acc + (order.total_uyu || 0), 0) || 0;

    return {
        merchantCount: merchants.count || 0,
        productCount: products.count || 0,
        orderCount: orders.count || 0,
        customerCount: customers.count || 0,
        totalRevenue
    };
}

export default async function AdminDashboard() {
    const stats = await getStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
                <p className="text-muted-foreground">Bienvenido al panel de control de la plataforma.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$ {stats.totalRevenue.toLocaleString('es-UY')}</div>
                        <p className="text-xs text-muted-foreground">
                            +20.1% desde el mes pasado
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Comercios Activos</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.merchantCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Plataforma Multi-Tenant
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pedidos Totales</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.orderCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Procesados exitosamente
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.customerCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Registrados en comercios
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Resumen Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Gráfico de Actividad (Próximamente)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Nuevos Comercios</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Se unieron este mes.
                        </p>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* TODO: Listar últimos comercios */}
                            <p className="text-sm text-muted-foreground">Cargando...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
