import type {
  AttendanceSituation,
  AttendanceSummary,
} from "@/types/coordinator";

type AttendanceRecord = Pick<AttendanceSummary, "frequencia" | "situacao">;

export const getAttendanceSituation = ({
  frequencia,
  situacao,
}: AttendanceRecord): AttendanceSituation => {
  if (situacao === "reprovado_por_falta") {
    return "reprovado_por_falta";
  }

  if (frequencia >= 80) {
    return "regular";
  }

  if (frequencia >= 75) {
    return "atencao";
  }

  return "risco_reprovacao";
};
