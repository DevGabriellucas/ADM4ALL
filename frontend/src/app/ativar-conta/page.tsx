import { ActivateAccountForm } from "@/components/ActivateAccountForm";

interface ActivateAccountPageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function ActivateAccountPage({
  searchParams,
}: ActivateAccountPageProps) {
  const { token } = await searchParams;
  const normalizedToken = Array.isArray(token) ? token[0] : token;

  return <ActivateAccountForm token={normalizedToken?.trim() || null} />;
}
