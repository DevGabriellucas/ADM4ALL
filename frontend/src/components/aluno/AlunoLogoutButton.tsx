"use client";

import { useRouter } from "next/navigation";
import { clearSession } from "@/services/sessionService";

export const AlunoLogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Sair da conta"
      className="flex items-center gap-x-2 rounded-md px-3 py-2 font-semibold text-[#8F1D2C] text-sm tracking-[0.15em] transition-colors hover:bg-red-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8F1D2C] sm:ml-auto"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-5 shrink-0 text-[#8F1D2C]"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
      <span>Sair</span>
    </button>
  );
};
