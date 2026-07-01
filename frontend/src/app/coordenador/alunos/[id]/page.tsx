import { notFound } from "next/navigation";
import { StudentDetailContent } from "@/components/coordenador/StudentDetailContent";
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

  return <StudentDetailContent student={student} />;
}
