import { ClassesPageContent } from "@/components/coordenador/ClassesPageContent";
import { BackButton } from "@/components/shared/BackButton";
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
    <>
      <BackButton className="mb-4" />
      <ClassesPageContent
        classes={classes}
        courses={courses}
        instructors={instructors}
      />
    </>
  );
}
