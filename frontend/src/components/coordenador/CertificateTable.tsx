import { CoordinatorStatusBadge } from "@/components/coordenador/CoordinatorStatusBadge";
import type {
  CertificateDisplayStatus,
  CertificateRecord,
} from "@/types/coordinator";
import { getCertificateStatus } from "@/utils/getCertificateStatus";

interface CertificateTableProps {
  certificates: CertificateRecord[];
}

const getStatusInfo = (status: CertificateDisplayStatus) => {
  if (status === "elegivel") {
    return { label: "Elegível", tone: "blue" as const };
  }
  if (status === "pendente") {
    return { label: "Pendente", tone: "amber" as const };
  }
  if (status === "emitido") {
    return { label: "Emitido", tone: "green" as const };
  }
  if (status === "cancelado") {
    return { label: "Cancelado", tone: "red" as const };
  }
  return { label: "Não elegível", tone: "red" as const };
};

const getCertificateLabel = (
  certificate: CertificateRecord,
  status: CertificateDisplayStatus,
) => {
  if (certificate.certificado) {
    return certificate.certificado;
  }
  if (status === "nao_elegivel") {
    return "Indisponível";
  }
  if (status === "cancelado") {
    return "Cancelado";
  }
  return "Aguardando emissão";
};

export const CertificateTable = ({ certificates }: CertificateTableProps) => {
  return (
    <section
      aria-labelledby="certificates-table-heading"
      className="rounded-lg border border-[#D5DDEC] bg-white p-5 shadow-sm"
    >
      <div className="mb-4">
        <h2
          id="certificates-table-heading"
          className="font-semibold text-slate-900 text-sm tracking-[0.2em]"
        >
          Certificados dos alunos
        </h2>
        <p className="mt-1 text-slate-500 text-xs">
          Elegibilidade calculada a partir da frequência registrada.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-6xl border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-slate-500 text-xs">
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Aluno
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Curso
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Turma
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Frequência
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Status
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Certificado
              </th>
              <th className="border-slate-200 border-b px-3 py-2 font-semibold">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {certificates.map((certificate) => {
              const certificateStatus = getCertificateStatus(certificate);
              const status = getStatusInfo(certificateStatus);

              return (
                <tr key={`${certificate.aluno}-${certificate.turma}`}>
                  <td className="border-slate-100 border-b px-3 py-3 font-medium text-slate-900">
                    {certificate.aluno}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {certificate.curso}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-700">
                    {certificate.turma}
                  </td>
                  <td
                    className={`border-slate-100 border-b px-3 py-3 font-semibold ${
                      certificate.frequencia < 80
                        ? "text-red-700"
                        : "text-slate-800"
                    }`}
                  >
                    {certificate.frequencia}%
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <CoordinatorStatusBadge
                      label={status.label}
                      tone={status.tone}
                    />
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3 text-slate-600 text-xs">
                    {getCertificateLabel(certificate, certificateStatus)}
                  </td>
                  <td className="border-slate-100 border-b px-3 py-3">
                    <div className="flex min-w-max flex-wrap gap-x-3 gap-y-2">
                      <button
                        type="button"
                        className="font-semibold text-brand-dark text-xs transition-colors hover:text-[#23275F]"
                      >
                        Visualizar
                      </button>
                      {certificateStatus === "elegivel" && (
                        <button
                          type="button"
                          className="font-semibold text-blue-700 text-xs transition-colors hover:text-blue-900"
                        >
                          Gerar certificado
                        </button>
                      )}
                      {certificateStatus === "pendente" && (
                        <button
                          type="button"
                          className="font-semibold text-emerald-700 text-xs transition-colors hover:text-emerald-900"
                        >
                          Marcar como emitido
                        </button>
                      )}
                      {certificateStatus === "emitido" && (
                        <button
                          type="button"
                          className="font-semibold text-blue-700 text-xs transition-colors hover:text-blue-900"
                        >
                          Baixar certificado
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {certificates.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-slate-500 text-sm"
                >
                  Nenhum certificado encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
