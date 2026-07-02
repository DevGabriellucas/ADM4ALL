import type {
  CertificateDisplayStatus,
  CertificateRecord,
} from "@/types/coordinator";

export const getCertificateStatus = (
  certificate: CertificateRecord,
): CertificateDisplayStatus => {
  if (certificate.status === "emitido") {
    return "emitido";
  }

  if (certificate.status === "pendente") {
    return "pendente";
  }

  if (certificate.status === "cancelado") {
    return "cancelado";
  }

  return certificate.elegivel ? "elegivel" : "nao_elegivel";
};
