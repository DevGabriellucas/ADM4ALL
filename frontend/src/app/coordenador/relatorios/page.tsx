import { ReportsPageContent } from "@/components/coordenador/ReportsPageContent";
import {
  getClasses,
  getCourses,
  getReports,
} from "@/services/coordinatorService";

export default async function CoordinatorReportsPage() {
  const [reports, courses, classes] = await Promise.all([
    getReports(),
    getCourses(),
    getClasses(),
  ]);

  return (
    <ReportsPageContent reports={reports} courses={courses} classes={classes} />
  );
}
