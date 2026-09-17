"use client";

import {
  atualizarAvatarAction,
  removerAvatarAction,
} from "@/app/instrutor/actions";
import { AvatarPanel } from "@/components/AvatarPanel";
import type { ArquivoUpload } from "@/types/instrutor";

interface AvatarUploadPanelProps {
  instrutorId: string;
  nome: string;
  avatarUrl: string | null;
}

/**
 * Foto do instrutor. A tela em si e a mesma de coordenacao e aluno; aqui so
 * amarramos as actions que gravam no cadastro de instrutor.
 */
export const AvatarUploadPanel = ({
  instrutorId,
  nome,
  avatarUrl,
}: AvatarUploadPanelProps) => {
  return (
    <AvatarPanel
      nome={nome}
      avatarUrl={avatarUrl}
      descricao="Use uma imagem quadrada ou centralizada para aparecer bem no painel do instrutor."
      salvarAction={(arquivo: ArquivoUpload) =>
        atualizarAvatarAction(instrutorId, arquivo)
      }
      removerAction={() => removerAvatarAction(instrutorId)}
    />
  );
};
