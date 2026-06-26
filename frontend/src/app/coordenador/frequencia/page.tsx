import { AttendancePageContent } from "@/components/coordenador/AttendancePageContent";
import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
import {
  getAttendanceSummary,
  getClasses,
  getCourses,
  getStudents,
} from "@/services/coordinatorService";

export default async function CoordinatorAttendancePage() {
  const [attendance, courses, classes, students] = await Promise.all([
    getAttendanceSummary(),
    getCourses(),
    getClasses(),
    getStudents(),
  ]);

  return (
    <CoordinatorLayout>
      <AttendancePageContent
        attendance={attendance}
        courses={courses}
        classes={classes}
        students={students}
      />
    </CoordinatorLayout>
  );
}
