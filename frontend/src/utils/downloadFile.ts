export interface DownloadableFile {
  base64: string;
  contentType: string;
  fileName: string;
}

/**
 * Entrega ao navegador um arquivo recebido da API em base64.
 *
 * O link precisa estar anexado ao documento antes do clique (o Firefox ignora
 * cliques em elementos fora do DOM) e a object URL so pode ser revogada depois
 * que o download comeca — revogar na mesma volta do event loop cancela o
 * download em navegadores baseados em Chromium.
 */
export const downloadBase64File = (file: DownloadableFile) => {
  const binary = atob(file.base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const url = URL.createObjectURL(
    new Blob([bytes], { type: file.contentType }),
  );

  const link = document.createElement("a");
  link.href = url;
  link.download = file.fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 0);
};
