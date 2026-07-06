import { InstructorsPageContent } from "@/components/coordenador/InstructorsPageContent";
import { BackButton } from "@/components/shared/BackButton";
import { getInstructors } from "@/services/coordinatorService";

export default async function CoordinatorInstructorsPage() {
  const instructors = await getInstructors();

  return (
    <>
      <BackButton className="mb-4" />
      <InstructorsPageContent instructors={instructors} />
    </>
  );
}
