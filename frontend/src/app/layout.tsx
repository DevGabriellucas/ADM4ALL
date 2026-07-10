import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Administracao para todos",
  description: "Administracao para todos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
