import { AuthenticatedLayout } from '@/components/authenticated-layout';

export default function InvoicesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
