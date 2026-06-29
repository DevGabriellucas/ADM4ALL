import type { CertificateRecord, CertificateStatus } from "@/types/coordinator";

export const getCertificateStatus = (
  certificate: CertificateRecord,
): CertificateStatus => {
  if (certificate.frequencia < 80) {
    return "nao_elegivel";
  }

  if (certificate.status === "emitido") {
    return "emitido";
  }

  if (certificate.status === "pendente") {
    return "pendente";
  }

  return "elegivel";
};
