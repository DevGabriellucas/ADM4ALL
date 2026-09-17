import {
  removerFotoCoordenadorAction,
  salvarFotoCoordenadorAction,
} from "@/app/coordenador/actions";
import { AvatarPanel } from "@/components/AvatarPanel";
import { BackButton } from "@/components/shared/BackButton";
import { Notificacao } from "@/components/shared/Notificacao";
import { getPerfilCoordenador } from "@/services/coordinatorService";

const PERFIL_LABEL: Record<string, string> = {
  coordenador: "Coordenador(a)",
  admin: "Administrador(a)",
};

export default async function CoordinatorPerfilPage() {
  const perfil = await getPerfilCoordenador();

  return (
    <>
      <BackButton className="mb-4" />

      <div className="flex flex-col gap-6">
        <AvatarPanel
          nome={perfil.nome}
          avatarUrl={perfil.avatarUrl}
          descricao="Use uma imagem quadrada ou centralizada para aparecer bem no painel da coordenação."
          salvarAction={salvarFotoCoordenadorAction}
          removerAction={removerFotoCoordenadorAction}
        />

        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h1 className="font-semibold text-lg text-slate-950">Perfil</h1>

          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-slate-500 text-xs">Nome</dt>
              <dd className="mt-1 text-slate-900 text-sm">{perfil.nome}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">E-mail</dt>
              <dd className="mt-1 text-slate-900 text-sm">{perfil.email}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">Perfil</dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {PERFIL_LABEL[perfil.perfil] ?? perfil.perfil}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 text-xs">
                Área de coordenação
              </dt>
              <dd className="mt-1 text-slate-900 text-sm">
                {perfil.areaCoordenacao ?? "Não informada"}
              </dd>
            </div>
          </dl>

          {/* O admin usa as mesmas telas sem ter cadastro de coordenador, e a
              foto fica presa a esse cadastro. Melhor avisar do que deixar o
              botao falhar sem explicacao. */}
          {!perfil.coordenadorId && (
            <Notificacao tipo="aviso" className="mt-5">
              Esta conta acessa a coordenação como{" "}
              {PERFIL_LABEL[perfil.perfil] ?? perfil.perfil}, sem cadastro de
              coordenador. A foto de perfil só fica disponível para contas com
              esse cadastro.
            </Notificacao>
          )}
        </section>
      </div>
    </>
  );
}
