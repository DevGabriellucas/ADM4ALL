import { UsersPageContent } from "@/components/coordenador/UsersPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { getUsers } from "@/services/coordinatorService";

export default async function CoordinatorUsersPage() {
  const users = await getUsers();

  return (
    <>
      <BackButton className="mb-4" />
      <UsersPageContent users={users} />
    </>
  );
}
