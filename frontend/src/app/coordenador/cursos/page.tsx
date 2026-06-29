import { CoursesPageContent } from "@/components/coordenador/CoursesPageContent";
import { getCourses } from "@/services/coordinatorService";

export default async function CoordinatorCoursesPage() {
  const courses = await getCourses();

  return <CoursesPageContent courses={courses} />;
}
