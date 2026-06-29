import { InstructorsPageContent } from "@/components/coordenador/InstructorsPageContent";
import { getInstructors } from "@/services/coordinatorService";

export default async function CoordinatorInstructorsPage() {
  const instructors = await getInstructors();

  return <InstructorsPageContent instructors={instructors} />;
}
