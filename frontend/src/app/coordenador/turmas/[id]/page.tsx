import { notFound } from "next/navigation";
import { ClassDetailsContent } from "@/components/coordenador/ClassDetailsContent";
import {
  getAttendanceSummary,
  getCertificates,
  getClassById,
  getClassMaterials,
  getClassStudentsAndLessons,
} from "@/services/coordinatorService";

interface CoordinatorClassDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function CoordinatorClassDetailsPage({
  params,
}: CoordinatorClassDetailsPageProps) {
  const { id } = await params;
  const classGroup = await getClassById(id);

  if (!classGroup) {
    notFound();
  }

  const [{ students, lessons }, attendance, materials, certificates] =
    await Promise.all([
      getClassStudentsAndLessons(id),
      getAttendanceSummary(),
      getClassMaterials(classGroup.nome),
      getCertificates(),
    ]);

  return (
    <ClassDetailsContent
      classGroup={classGroup}
      students={students}
      lessons={lessons}
      attendance={attendance.filter(
        (record) => record.turma === classGroup.nome,
      )}
      materials={materials}
      certificates={certificates.filter(
        (certificate) => certificate.turma === classGroup.nome,
      )}
    />
  );
}
