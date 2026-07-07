import { notFound } from "next/navigation";
import { InstructorDetailContent } from "@/components/coordenador/InstructorDetailContent";
import { BackButton } from "@/components/shared/BackButton";
import { getInstructorById } from "@/services/coordinatorService";

interface CoordinatorInstructorDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ modo?: string }>;
}

export default async function CoordinatorInstructorDetailPage({
  params,
  searchParams,
}: CoordinatorInstructorDetailPageProps) {
  const { id } = await params;
  const { modo } = await searchParams;
  const instructor = await getInstructorById(id);

  if (!instructor) {
    notFound();
  }

  return (
    <>
      <BackButton className="mb-4" />
      <InstructorDetailContent
        instructor={instructor}
        initialMode={modo === "editar" ? "editar" : undefined}
      />
    </>
  );
}
