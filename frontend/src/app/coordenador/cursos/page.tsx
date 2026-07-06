import { CoursesPageContent } from "@/components/coordenador/CoursesPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { getCourses } from "@/services/coordinatorService";

export default async function CoordinatorCoursesPage() {
  const courses = await getCourses();

  return (
    <>
      <BackButton className="mb-4" />
      <CoursesPageContent courses={courses} />
    </>
  );
}
