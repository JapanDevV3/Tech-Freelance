import { listActiveServices } from '@/services/catalog.service';
import { formatBaht } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/layout/container';

export default async function ServicesPage() {
    const services = await listActiveServices();

    return (
        <Container size="md">
            <h1 className="text-2xl font-semibold mb-6">บริการทั้งหมด</h1>
            {services.length === 0 ? (
                <p className="text-muted-foreground">ยังไม่มีบริการ</p>
            ) : (
                <div className="grid gap-4">
                    {services.map((s) => (
                        <Card key={s.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    <span>{s.title}</span>
                                    <span className="text-primary whitespace-nowrap">{formatBaht(s.basePriceAmount)}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                <p className="text-sm">{s.description}</p>
                                <p className="text-xs text-muted-foreground">โดย {s.technician.displayName}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    );
}