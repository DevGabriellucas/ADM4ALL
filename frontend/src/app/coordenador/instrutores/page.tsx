import { CoordinatorLayout } from "@/components/coordenador/CoordinatorLayout";
import { InstructorsPageContent } from "@/components/coordenador/InstructorsPageContent";
import { getInstructors } from "@/services/coordinatorService";

export default async function CoordinatorInstructorsPage() {
  const instructors = await getInstructors();

  return (
    <CoordinatorLayout>
      <InstructorsPageContent instructors={instructors} />
    </CoordinatorLayout>
  );
}
