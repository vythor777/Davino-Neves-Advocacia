import type { Metadata } from "next";
import { Inter, Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Davino Neves Advocacia | Inteligência Jurídica & Tecnologia Processual",
  description: "Sociedade de advogados e plataforma avançada de gestão jurídica com contencioso estratégico, controladoria, integração direta ao DataJud CNJ e IA preditiva.",
  openGraph: {
    title: "Davino Neves Advocacia | Inteligência Jurídica & Tecnologia Processual",
    description: "Sociedade de advogados e plataforma avançada de gestão jurídica com contencioso estratégico, controladoria, integração direta ao DataJud CNJ e IA preditiva.",
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
      className={`h-full antialiased scroll-smooth ${inter.variable} ${cinzel.variable} ${playfair.variable}`}
    >
      <body className="min-h-full font-sans bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-blue-600 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

