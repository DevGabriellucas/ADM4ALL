import { obterConfiguracoesAction } from "@/app/coordenador/actions";
import { SettingsPageContent } from "@/components/coordenador/SettingsPageContent";
import { BackButton } from "@/components/shared/BackButton";

export default async function CoordinatorSettingsPage() {
  const configuracoes = await obterConfiguracoesAction();

  return (
    <>
      <BackButton className="mb-4" />
      <SettingsPageContent configuracoesInicial={configuracoes} />
    </>
  );
}
