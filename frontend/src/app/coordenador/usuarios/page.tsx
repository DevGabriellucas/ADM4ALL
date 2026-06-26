import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
import { UsersPageContent } from "@/components/coordenador/UsersPageContent";
import { getUsers } from "@/services/coordinatorService";

export default async function CoordinatorUsersPage() {
  const users = await getUsers();

  return (
    <CoordinatorLayout>
      <UsersPageContent users={users} />
    </CoordinatorLayout>
  );
}
