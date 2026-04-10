import { AuthenticatedLayout } from '@/components/authenticated-layout';

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
