import { UsersPageContent } from "@/components/coordenador/UsersPageContent";
import { getUsers } from "@/services/coordinatorService";

export default async function CoordinatorUsersPage() {
  const users = await getUsers();

  return <UsersPageContent users={users} />;
}
