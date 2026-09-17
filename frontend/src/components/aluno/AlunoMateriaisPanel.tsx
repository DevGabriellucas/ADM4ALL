import { baixarMaterialAlunoAction } from "@/app/aluno/actions";
import { BotaoBaixarMaterial } from "@/components/shared/BotaoBaixarMaterial";
import type { MaterialVisivelAluno } from "@/types/aluno";
import { formatData, formatTamanho, formatTipoMaterial } from "@/utils/format";

interface AlunoMateriaisPanelProps {
  materiais: MaterialVisivelAluno[];
  erroCarregamento?: boolean;
}

export const AlunoMateriaisPanel = ({
  materiais,
  erroCarregamento = false,
}: AlunoMateriaisPanelProps) => {
  const materiaisSeguros = Array.isArray(materiais) ? materiais : [];
  const ehUrlExterna = (valor: string) => /^https?:\/\//i.test(valor);

  return (
    <section
      aria-labelledby="materiais-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="materiais-heading"
            className="font-semibold text-lg text-slate-950"
          >
            Materiais
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Arquivos e links liberados pelo instrutor para sua turma.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700 text-xs">
          {materiaisSeguros.length} disponíveis
        </span>
      </div>

      {erroCarregamento ? (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-red-50 px-4 py-5 text-center text-red-700 text-sm"
        >
          Não foi possível carregar os materiais agora. Tente novamente mais
          tarde.
        </p>
      ) : materiaisSeguros.length === 0 ? (
        <p className="mt-5 rounded-lg bg-white px-4 py-5 text-center text-slate-500 text-sm">
          Nenhum material visível no momento.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {materiaisSeguros.map((material) => {
            return (
              <article
                key={material.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3
                      className="font-semibold text-slate-900 text-sm"
                      data-testid="aluno-material-title"
                    >
                      {material.titulo}
                    </h3>
                    <p className="mt-1 text-slate-500 text-xs">
                      {material.aulaTitulo ?? "Material geral da turma"}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-light/50 px-2 py-0.5 font-medium text-slate-700 text-xs">
                    {formatTipoMaterial(material.tipo)}
                  </span>
                </div>

                {material.descricao && (
                  <p className="mt-3 text-slate-600 text-sm leading-6">
                    {material.descricao}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-slate-500 text-xs">
                  <span>{formatData(material.dataPublicacao)}</span>
                  <span>{formatTamanho(material.tamanhoBytes)}</span>
                </div>

                {material.urlArquivo ? (
                  <div className="mt-4">
                    {ehUrlExterna(material.urlArquivo) ? (
                      <a
                        href={material.urlArquivo}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-fit items-center rounded-md bg-brand-dark px-3 font-semibold text-sm text-white transition-colors hover:bg-brand-medium"
                      >
                        Abrir link
                      </a>
                    ) : (
                      <BotaoBaixarMaterial
                        baixar={baixarMaterialAlunoAction.bind(
                          null,
                          material.id,
                        )}
                        modo={material.tipo === "video" ? "abrir" : "baixar"}
                      />
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-slate-400 text-xs">
                    Material sem arquivo ou link anexado.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
