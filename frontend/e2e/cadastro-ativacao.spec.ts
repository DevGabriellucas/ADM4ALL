import { expect, type Page, test } from "@playwright/test";

/**
 * Fluxo do cadastro publico: forca da senha, bloqueio de senha fraca e a volta
 * para o login com o aviso do e-mail de ativacao.
 *
 * O teste cria um aluno de verdade no banco (com CPF e e-mail unicos por
 * execucao) porque e justamente isso que esta sendo verificado. Cada execucao
 * dispara um e-mail de ativacao real pelo SMTP configurado.
 */

const calcularDigito = (base: number[]): number => {
  const soma = base.reduce(
    (acumulado, digito, indice) =>
      acumulado + digito * (base.length + 1 - indice),
    0,
  );
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
};

/** CPF com digito verificador valido, derivado de um numero de 9 digitos. */
const gerarCpfValido = (semente: number): string => {
  const base = String(semente % 1_000_000_000)
    .padStart(9, "0")
    .split("")
    .map(Number);
  const primeiro = calcularDigito(base);
  const segundo = calcularDigito([...base, primeiro]);

  return `${base.join("")}${primeiro}${segundo}`;
};

const SENHA_FORTE = "AlunoFluxo@2026";

const campoSenha = (page: Page) =>
  page.getByPlaceholder("Crie sua senha do sistema");

test.describe("Cadastro publico e ativacao", () => {
  test("barrinha muda de cor conforme a senha digitada", async ({ page }) => {
    await page.goto("/cadastro");

    const senha = campoSenha(page);
    // A cor e o unico sinal visivel; o nivel escrito fica so para leitor de
    // tela, entao o teste confere os dois.
    const segmentos = (cor: string) => page.locator(`span.${cor}`);
    const nivelParaLeitorDeTela = (nivel: string) =>
      page.getByText(`Nível de segurança da senha: ${nivel}`);

    await senha.fill("abc");
    await expect(segmentos("bg-red-600")).toHaveCount(1);
    await expect(nivelParaLeitorDeTela("Fraco")).toBeAttached();

    await senha.fill("senha123");
    await expect(segmentos("bg-amber-500")).toHaveCount(2);
    await expect(nivelParaLeitorDeTela("Médio")).toBeAttached();

    await senha.fill(SENHA_FORTE);
    await expect(segmentos("bg-emerald-600")).toHaveCount(3);
    await expect(nivelParaLeitorDeTela("Forte")).toBeAttached();
  });

  test("requisitos da senha so aparecem com o campo em foco", async ({
    page,
  }) => {
    await page.goto("/cadastro");

    const requisito = page.getByText("1 caractere especial", { exact: false });
    await expect(requisito).toBeHidden();

    await campoSenha(page).focus();
    await expect(requisito).toBeVisible();

    await page.getByPlaceholder("Repita sua senha").focus();
    await expect(requisito).toBeHidden();
  });

  test("curso da UNIPE e uma lista pronta", async ({ page }) => {
    await page.goto("/cadastro");

    await page.getByLabel("Sou aluno da UNIPE").check();

    const curso = page.locator('select[name="cursoUnipe"]');
    await expect(curso).toBeVisible();
    await expect(curso.locator("option")).toHaveCount(29);
    await curso.selectOption("Engenharia de Software");
    await expect(curso).toHaveValue("Engenharia de Software");
  });

  test("senha sem maiuscula, numero ou especial nao passa", async ({
    page,
  }) => {
    await page.goto("/cadastro");

    await campoSenha(page).fill("senhafraca");
    await page.getByPlaceholder("Repita sua senha").fill("senhafraca");
    await page.getByRole("button", { name: "Cadastrar" }).click();

    await expect(
      page.getByText("A senha precisa ter uma letra maiúscula."),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/cadastro/);
  });

  test("cadastro completo leva para o login com o aviso de ativacao", async ({
    page,
  }) => {
    const marca = Date.now();
    const cpf = gerarCpfValido(marca);
    const email = `aluno.fluxo.${marca}@adm4all.edu.br`;

    await page.goto("/cadastro");

    const treinamento = page.locator('select[name="treinamento"]');
    await expect(treinamento).toBeEnabled();
    await expect
      .poll(async () => await treinamento.locator("option").count())
      .toBeGreaterThan(1);

    await page.getByPlaceholder("Ex.: Ana Clara Silva").fill("Aluno Fluxo QA");
    await page.getByPlaceholder("000.000.000-00").fill(cpf);
    await page.getByPlaceholder("(83) 99999-9999").fill("83999990000");
    await page.locator('input[type="date"]').fill("2000-05-10");
    await page.getByPlaceholder("nome@email.com").fill(email);
    await campoSenha(page).fill(SENHA_FORTE);
    await page.getByPlaceholder("Repita sua senha").fill(SENHA_FORTE);
    await treinamento.selectOption({ index: 1 });

    await page.getByRole("button", { name: "Cadastrar" }).click();

    // Sai do cadastro e chega no login ja com o recado do e-mail de ativacao.
    await expect(page).toHaveURL(/\/\?cadastro=(ativacao-enviada|sem-email)/);
    await expect(page.getByText(/Cadastro realizado/)).toBeVisible();

    // Conta recem-criada esta pendente: o login precisa dizer o motivo em vez
    // de acusar credencial invalida.
    await page.getByPlaceholder("E-mail ou CPF").fill(email);
    await page.getByPlaceholder("Senha de acesso").fill(SENHA_FORTE);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.getByText(/conta ainda não foi ativada/i)).toBeVisible();
  });
});

/**
 * Entrada e saida usam a conta de QA que ja existe no banco. A senha nao fica
 * no repositorio: passe `E2E_ALUNO_SENHA` ao rodar, senao o teste e pulado.
 */
const ALUNO_QA = {
  login: process.env.E2E_ALUNO_LOGIN ?? "aluno.teste.qa@adm4all.edu.br",
  senha: process.env.E2E_ALUNO_SENHA ?? "",
};

test.describe("Entrada e saida do sistema", () => {
  test.skip(
    !ALUNO_QA.senha,
    "defina E2E_ALUNO_SENHA com a senha da conta de teste",
  );

  test("sair do sistema volta ao login com o aviso padrao", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByPlaceholder("E-mail ou CPF").fill(ALUNO_QA.login);
    await page.getByPlaceholder("Senha de acesso").fill(ALUNO_QA.senha);
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/aluno\/dashboard/);

    await page.getByRole("button", { name: "Sair da conta" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Sair" })
      .click();

    await expect(page).toHaveURL(/\/\?logout=ok/);
    await expect(page.getByText(/Você saiu do sistema/)).toBeVisible();
  });
});
