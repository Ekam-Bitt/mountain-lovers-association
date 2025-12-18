import { AdminUserList } from "@/components/admin/AdminUserList";
import { requireAdmin } from "@/lib/auth-guard";
import prisma from "@/lib/db";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">Manage user roles and access.</p>
      </div>
      <AdminUserList initialUsers={serializedUsers} />
    </div>
  );
}
