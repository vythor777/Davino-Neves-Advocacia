import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Davino Neves Advocacia | Gestão Jurídica",
  description: "Plataforma corporativa de gestão jurídica com controle de processos, clientes, prazos e inteligência processual.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="h-full font-sans bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

