import { ClassesPageContent } from "@/components/coordenador/ClassesPageContent";
import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
import {
  getClasses,
  getCourses,
  getInstructors,
} from "@/services/coordinatorService";

export default async function CoordinatorClassesPage() {
  const [classes, courses, instructors] = await Promise.all([
    getClasses(),
    getCourses(),
    getInstructors(),
  ]);

  return (
    <CoordinatorLayout>
      <ClassesPageContent
        classes={classes}
        courses={courses}
        instructors={instructors}
      />
    </CoordinatorLayout>
  );
}
