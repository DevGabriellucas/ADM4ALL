import { RedefinirSenhaForm } from "@/components/RedefinirSenhaForm";

interface RedefinirSenhaPageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function RedefinirSenhaPage({
  searchParams,
}: RedefinirSenhaPageProps) {
  const { token } = await searchParams;
  const tokenNormalizado = Array.isArray(token) ? token[0] : token;

  return <RedefinirSenhaForm token={tokenNormalizado ?? null} />;
}
