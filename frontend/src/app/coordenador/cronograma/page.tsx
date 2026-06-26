import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
import { SchedulePageContent } from "@/components/coordenador/SchedulePageContent";
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
    <CoordinatorLayout>
      <SchedulePageContent
        lessons={lessons}
        courses={courses}
        classes={classes}
        instructors={instructors}
      />
    </CoordinatorLayout>
  );
}
