import { StudentsPageContent } from "@/components/coordenador/StudentsPageContent";
import { BackButton } from "@/components/shared/BackButton";
import {
  getClasses,
  getCourses,
  getStudents,
} from "@/services/coordinatorService";

export default async function CoordinatorStudentsPage() {
  const [students, courses, classes] = await Promise.all([
    getStudents(),
    getCourses(),
    getClasses(),
  ]);

  return (
    <>
      <BackButton className="mb-4" />
      <StudentsPageContent
        students={students}
        courses={courses}
        classes={classes}
      />
    </>
  );
}
