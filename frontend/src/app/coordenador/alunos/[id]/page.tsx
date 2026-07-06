import { notFound } from "next/navigation";
import { StudentDetailContent } from "@/components/coordenador/StudentDetailContent";
import { BackButton } from "@/components/shared/BackButton";
import { getStudentById } from "@/services/coordinatorService";

interface CoordinatorStudentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CoordinatorStudentDetailPage({
  params,
}: CoordinatorStudentDetailPageProps) {
  const { id } = await params;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  return (
    <>
      <BackButton className="mb-4" />
      <StudentDetailContent student={student} />
    </>
  );
}
