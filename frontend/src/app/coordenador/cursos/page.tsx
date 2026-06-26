import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
import { CoursesPageContent } from "@/components/coordenador/CoursesPageContent";
import { getCourses } from "@/services/coordinatorService";

export default async function CoordinatorCoursesPage() {
  const courses = await getCourses();

  return (
    <CoordinatorLayout>
      <CoursesPageContent courses={courses} />
    </CoordinatorLayout>
  );
}
