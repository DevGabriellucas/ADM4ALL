import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
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
    <CoordinatorLayout>
      <StudentsPageContent
        students={students}
        courses={courses}
        classes={classes}
      />
    </CoordinatorLayout>
  );
}
