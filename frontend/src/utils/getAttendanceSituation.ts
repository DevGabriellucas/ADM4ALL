import { MATRICULA_STATUS } from "@/constants/matriculaStatus";
import type {
  AttendanceSituation,
  AttendanceSummary,
} from "@/types/coordinator";

type AttendanceRecord = Pick<AttendanceSummary, "frequencia" | "situacao">;

export const getAttendanceSituation = ({
  frequencia,
  situacao,
}: AttendanceRecord): AttendanceSituation => {
  if (situacao === MATRICULA_STATUS.REPROVADO_FALTA) {
    return MATRICULA_STATUS.REPROVADO_FALTA;
  }

  if (frequencia >= 80) {
    return "regular";
  }

  if (frequencia >= 75) {
    return "atencao";
  }

  return "risco_reprovacao";
};
