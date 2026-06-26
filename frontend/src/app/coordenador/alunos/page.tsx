import { StudentsPageContent } from "@/components/coordenador/StudentsPageContent";
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
    <StudentsPageContent
      students={students}
      courses={courses}
      classes={classes}
    />
  );
}
