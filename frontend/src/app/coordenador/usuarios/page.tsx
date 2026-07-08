import { UsersPageContent } from "@/components/coordenador/UsersPageContent";
import { BackButton } from "@/components/shared/BackButton";
import {
  getClasses,
  getCourses,
  getUsers,
} from "@/services/coordinatorService";

export default async function CoordinatorUsersPage() {
  const [users, courses, classes] = await Promise.all([
    getUsers(),
    getCourses(),
    getClasses(),
  ]);

  return (
    <>
      <BackButton className="mb-4" />
      <UsersPageContent users={users} courses={courses} classes={classes} />
    </>
  );
}
