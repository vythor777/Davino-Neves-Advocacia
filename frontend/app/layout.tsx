import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Davino Neves Advocacia • Painel Executivo",
  description: "Plataforma corporativa de gestão jurídica com controle de processos, clientes, prazos e inteligência processual.",
  openGraph: {
    title: "Davino Neves Advocacia • Painel Executivo",
    description: "Plataforma corporativa de gestão jurídica com controle de processos, clientes, prazos e inteligência processual.",
  },
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
      className={`h-full antialiased ${plusJakartaSans.variable}`}
    >
      <body className="h-full font-sans bg-[#f6f8fa] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

