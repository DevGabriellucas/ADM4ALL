import { notFound } from "next/navigation";
import { CourseDetailsContent } from "@/components/coordenador/CourseDetailsContent";
import { BackButton } from "@/components/shared/BackButton";
import {
  getClassesByCourse,
  getCourseById,
  getInstructors,
} from "@/services/coordinatorService";

interface CoordinatorCourseDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CoordinatorCourseDetailsPage({
  params,
}: CoordinatorCourseDetailsPageProps) {
  const { id } = await params;

  const [course, classes, instructors] = await Promise.all([
    getCourseById(id),
    getClassesByCourse(id),
    getInstructors(),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <>
      <BackButton className="mb-4" />
      <CourseDetailsContent
        course={course}
        classes={classes}
        instructors={instructors}
      />
    </>
  );
}
