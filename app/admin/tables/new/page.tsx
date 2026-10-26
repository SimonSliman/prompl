import { AdminShell } from "@/components/admin/AdminShell";
import { TableForm } from "@/components/admin/TableForm";
import { adminCreateTableAction, requireAdmin } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

export default async function NewTablePage() {
  await requireAdmin();
  return (
    <AdminShell title="New table">
      <TableForm action={adminCreateTableAction} submitLabel="Create table" />
    </AdminShell>
  );
}
