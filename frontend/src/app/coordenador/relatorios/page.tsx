import { ReportsPageContent } from "@/components/coordenador/ReportsPageContent";
import { BackButton } from "@/components/shared/BackButton";
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
    <>
      <BackButton className="mb-4" />
      <ReportsPageContent reports={reports} courses={courses} classes={classes} />
    </>
  );
}
