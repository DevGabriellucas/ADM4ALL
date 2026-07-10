import { expect, type Page, test } from "@playwright/test";

const USUARIOS = {
  coordenador: {
    login: "amanda.souza@example.com",
    senha: "Coordenador@123",
    destino: /\/coordenador\/dashboard/,
  },
  instrutor: {
    login: "eduardo.lima@example.com",
    senha: "Instrutor@123",
    destino: /\/instrutor\/dashboard/,
  },
  aluno: {
    login: "priscilla.cahino@example.com",
    senha: "Aluno@123",
    destino: /\/aluno\/dashboard/,
  },
};

const entrarComo = async (
  page: Page,
  usuario: (typeof USUARIOS)[keyof typeof USUARIOS],
) => {
  await page.goto("/");
  await page.getByPlaceholder("E-mail ou CPF").fill(usuario.login);
  await page.getByPlaceholder("Senha de acesso").fill(usuario.senha);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(usuario.destino);
};

test.describe("MVP ADM4All", () => {
  test("login do coordenador e acesso as areas principais", async ({
    page,
  }) => {
    await entrarComo(page, USUARIOS.coordenador);
    await expect(page.getByText("Dashboard")).toBeVisible();

    await page.getByRole("link", { name: "Certificados" }).click();
    await expect(page).toHaveURL(/\/coordenador\/certificados/);
    await expect(page.getByText("Certificados").first()).toBeVisible();

    await page.getByRole("link", { name: "Configuracoes" }).click();
    await expect(page).toHaveURL(/\/coordenador\/configuracoes/);
  });

  test("cadastro carrega e permite selecionar treinamento", async ({
    page,
  }) => {
    await page.goto("/cadastro");

    const treinamento = page.locator('select[name="treinamento"]');
    await expect(treinamento).toBeEnabled();
    await expect
      .poll(async () => await treinamento.locator("option").count())
      .toBeGreaterThan(1);

    const primeiroTreinamento = await treinamento
      .locator("option")
      .nth(1)
      .getAttribute("value");

    expect(primeiroTreinamento).toBeTruthy();
    await treinamento.selectOption(primeiroTreinamento ?? "");
    await expect(treinamento).toHaveValue(primeiroTreinamento ?? "");
  });

  test("recuperar e redefinir senha mantem layout navegavel", async ({
    page,
  }) => {
    await page.goto("/recuperar-senha");
    await expect(page.getByRole("link", { name: "Voltar" })).toBeVisible();
    await expect(page.getByPlaceholder("E-mail")).toBeVisible();

    await page.goto("/redefinir-senha?token=invalido");
    await expect(page.getByRole("link", { name: "Voltar" })).toBeVisible();
    await expect(page.getByPlaceholder("Nova senha")).toBeVisible();
    await expect(page.getByPlaceholder("Confirmar nova senha")).toBeVisible();
  });

  test("instrutor abre menu e modal de edicao do cronograma", async ({
    page,
  }) => {
    await entrarComo(page, USUARIOS.instrutor);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Abrir menu" }).click();
    await expect(
      page.getByRole("dialog", { name: "Menu de navegacao" }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Cronograma" }).click();
    await expect(page).toHaveURL(/\/instrutor\/cronograma/);

    const editar = page.getByRole("button", { name: "Editar" }).first();
    await expect(editar).toBeVisible();
    await editar.click();
    await expect(
      page.getByRole("dialog", { name: "Editar aula" }),
    ).toBeVisible();
  });

  test("aluno visualiza materiais sem cards duplicados", async ({ page }) => {
    await entrarComo(page, USUARIOS.aluno);
    await expect(page.getByText("Materiais")).toBeVisible();

    const titulos = await page
      .locator('[data-testid="aluno-material-title"]')
      .allTextContents();

    const normalizados = titulos.map((titulo) => titulo.trim()).filter(Boolean);
    expect(new Set(normalizados).size).toBe(normalizados.length);
  });
});
