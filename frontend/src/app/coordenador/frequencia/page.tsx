import { AttendancePageContent } from "@/components/coordenador/AttendancePageContent";
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
    <AttendancePageContent
      attendance={attendance}
      courses={courses}
      classes={classes}
      students={students}
    />
  );
}
