import { AttendancePageContent } from "@/components/coordenador/AttendancePageContent";
import { BackButton } from "@/components/shared/BackButton";
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
    <>
      <BackButton className="mb-4" />
      <AttendancePageContent
        attendance={attendance}
        courses={courses}
        classes={classes}
        students={students}
      />
    </>
  );
}
