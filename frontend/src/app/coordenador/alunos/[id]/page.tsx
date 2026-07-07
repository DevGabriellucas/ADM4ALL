import { notFound } from "next/navigation";
import { StudentDetailContent } from "@/components/coordenador/StudentDetailContent";
import { BackButton } from "@/components/shared/BackButton";
import { getStudentById } from "@/services/coordinatorService";

interface CoordinatorStudentDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ modo?: string }>;
}

export default async function CoordinatorStudentDetailPage({
  params,
  searchParams,
}: CoordinatorStudentDetailPageProps) {
  const { id } = await params;
  const { modo } = await searchParams;
  const student = await getStudentById(id);

  if (!student) {
    notFound();
  }

  const initialMode =
    modo === "editar" || modo === "vincular" ? modo : undefined;

  return (
    <>
      <BackButton className="mb-4" />
      <StudentDetailContent student={student} initialMode={initialMode} />
    </>
  );
}
