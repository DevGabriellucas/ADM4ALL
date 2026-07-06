import { SchedulePageContent } from "@/components/coordenador/SchedulePageContent";
import { BackButton } from "@/components/shared/BackButton";
import {
  getClasses,
  getCourses,
  getInstructors,
  getLessons,
} from "@/services/coordinatorService";

export default async function CoordinatorSchedulePage() {
  const [lessons, courses, classes, instructors] = await Promise.all([
    getLessons(),
    getCourses(),
    getClasses(),
    getInstructors(),
  ]);

  return (
    <>
      <BackButton className="mb-4" />
      <SchedulePageContent
        lessons={lessons}
        courses={courses}
        classes={classes}
        instructors={instructors}
      />
    </>
  );
}
