export const FUSO_DA_INSTITUICAO = "America/Sao_Paulo";

// Data e hora de agora no fuso da instituicao, como "YYYY-MM-DDTHH:MM".
//
// O fuso vai explicito porque as telas sao renderizadas no servidor, dentro de
// um container em UTC, e depois hidratadas no navegador, em BRT. Usando o fuso
// do runtime, as duas pontas discordam: depois das 21h em Joao Pessoa o
// servidor ja esta no dia seguinte, e a aula de hoje some do painel.
export const agoraNaInstituicao = () =>
  new Intl.DateTimeFormat("sv-SE", {
    timeZone: FUSO_DA_INSTITUICAO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(new Date())
    .replace(" ", "T");

// Data de hoje no fuso da instituicao, como "YYYY-MM-DD", no mesmo formato em
// que o backend entrega `data_aula`.
export const dataDeHoje = () => agoraNaInstituicao().slice(0, 10);
