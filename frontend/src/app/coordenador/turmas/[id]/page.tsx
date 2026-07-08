import { notFound } from "next/navigation";
import { ClassDetailsContent } from "@/components/coordenador/ClassDetailsContent";
import { BackButton } from "@/components/shared/BackButton";
import {
  getAttendanceSummary,
  getCertificates,
  getClassById,
  getClassMaterials,
  getClassStudentsAndLessons,
  getCourses,
  getInstructors,
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

  const [
    { students, lessons },
    attendance,
    materials,
    certificates,
    courses,
    instructors,
  ] = await Promise.all([
    getClassStudentsAndLessons(id),
    getAttendanceSummary(),
    getClassMaterials(id, classGroup),
    getCertificates(),
    getCourses(),
    getInstructors(),
  ]);

  return (
    <>
      <BackButton className="mb-4" />
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
        courses={courses}
        instructors={instructors}
      />
    </>
  );
}
