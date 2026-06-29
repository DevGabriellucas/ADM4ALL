import { notFound } from "next/navigation";
import { ClassDetailsContent } from "@/components/coordenador/ClassDetailsContent";
import {
  getAttendanceSummary,
  getCertificates,
  getClassById,
  getClassMaterials,
  getLessons,
  getStudents,
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

  const [students, lessons, attendance, materials, certificates] =
    await Promise.all([
      getStudents(),
      getLessons(),
      getAttendanceSummary(),
      getClassMaterials(classGroup.nome),
      getCertificates(),
    ]);

  return (
    <ClassDetailsContent
      classGroup={classGroup}
      students={students.filter((student) => student.turma === classGroup.nome)}
      lessons={lessons.filter((lesson) => lesson.turma === classGroup.nome)}
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
