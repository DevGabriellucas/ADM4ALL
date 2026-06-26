import {
  coordinatorAttendanceMock,
  coordinatorCertificatesMock,
  coordinatorClassesMock,
  coordinatorClassMaterialsMock,
  coordinatorCoursesMock,
  coordinatorDashboardSummaryMock,
  coordinatorInstructorsMock,
  coordinatorLessonsMock,
  coordinatorProcessesMock,
  coordinatorStudentsMock,
  coordinatorUsersMock,
} from "@/mocks/coordinatorMock";
import type {
  AttendanceSummary,
  BaseUser,
  CertificateRecord,
  ClassGroup,
  ClassMaterial,
  CoordinatorDashboardSummary,
  Course,
  Instructor,
  Lesson,
  ProcessRecord,
  Student,
} from "@/types/coordinator";

// MOCK TEMPORARIO:
// Esta camada concentra os dados usados pela area do coordenador/admin.
// Quando o backend entregar os contratos, substituimos os retornos por fetch
// mantendo as paginas consumindo as mesmas funcoes.

export const getDashboardSummary =
  async (): Promise<CoordinatorDashboardSummary> => {
    return coordinatorDashboardSummaryMock;
  };

export const getCourses = async (): Promise<Course[]> => {
  return coordinatorCoursesMock;
};

export const getInstructors = async (): Promise<Instructor[]> => {
  return coordinatorInstructorsMock;
};

export const getStudents = async (): Promise<Student[]> => {
  return coordinatorStudentsMock;
};

export const getClasses = async (): Promise<ClassGroup[]> => {
  return coordinatorClassesMock;
};

export const getClassById = async (
  id: string,
): Promise<ClassGroup | undefined> => {
  return coordinatorClassesMock.find((classGroup) => classGroup.id === id);
};

export const getClassMaterials = async (
  className: string,
): Promise<ClassMaterial[]> => {
  return coordinatorClassMaterialsMock.filter(
    (material) => material.turma === className,
  );
};

export const getAttendanceSummary = async (): Promise<AttendanceSummary[]> => {
  return coordinatorAttendanceMock;
};

export const getLessons = async (): Promise<Lesson[]> => {
  return coordinatorLessonsMock;
};

export const getCertificates = async (): Promise<CertificateRecord[]> => {
  return coordinatorCertificatesMock;
};

export const getProcesses = async (): Promise<ProcessRecord[]> => {
  return coordinatorProcessesMock;
};

export const getUsers = async (): Promise<BaseUser[]> => {
  return coordinatorUsersMock;
};
