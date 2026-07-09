import { UsersPageContent } from "@/components/coordenador/UsersPageContent";
import { BackButton } from "@/components/shared/BackButton";
import {
  getClasses,
  getCourses,
  getUsers,
} from "@/services/coordinatorService";
import { getServerSession } from "@/services/serverSessionService";

export default async function CoordinatorUsersPage() {
  const [users, courses, classes, session] = await Promise.all([
    getUsers(),
    getCourses(),
    getClasses(),
    getServerSession(),
  ]);

  return (
    <>
      <BackButton className="mb-4" />
      <UsersPageContent
        users={users}
        courses={courses}
        classes={classes}
        currentUserId={session?.usuarioId ?? null}
      />
    </>
  );
}
