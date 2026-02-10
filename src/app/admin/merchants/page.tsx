import { createClient } from "@/lib/supabase-server";
import { Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

async function getMerchants() {
    const supabase = await createClient();
    const { data: merchants, error } = await supabase
        .from("merchants")
        .select("*, plans(name)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching merchants:", error);
        return [];
    }

    return merchants;
}

export default async function AdminMerchantsPage() {
    const merchants = await getMerchants();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Comercios</h1>
                    <p className="text-muted-foreground">
                        Gestiona los {merchants.length} comercios registrados en la plataforma.
                    </p>
                </div>
                <Button>Invitar Comercio</Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Verificado</TableHead>
                            <TableHead>Registrado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {merchants.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No hay comercios registrados.
                                </TableCell>
                            </TableRow>
                        ) : (
                            merchants.map((merchant) => (
                                <TableRow key={merchant.id}>
                                    <TableCell className="font-medium">{merchant.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{merchant.slug}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{merchant.plans?.name || "Sin Plan"}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={merchant.is_active ? "default" : "secondary"}>
                                            {merchant.is_active ? "Activo" : "Inactivo"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {merchant.is_verified ? (
                                            <Badge className="bg-green-500 hover:bg-green-600">Sí</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">No</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(merchant.created_at), "PPP", { locale: es })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm">
                                            Editar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
