import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Davino Neves Advocacia | Gestão Jurídica",
  description: "Plataforma corporativa de gestão jurídica com controle de processos, clientes, prazos e inteligência processual.",
  applicationName: "Davino Neves Advocacia",
  authors: [{ name: "Davino Neves Advocacia" }],
  keywords: [
    "gestão jurídica",
    "advocacia",
    "processos judiciais",
    "prazos processuais",
    "DataJud CNJ",
    "controladoria jurídica",
    "Davino Neves",
  ],
  creator: "Davino Neves Advocacia",
  publisher: "Davino Neves Advocacia",
  openGraph: {
    title: "Davino Neves Advocacia | Gestão Jurídica",
    description: "Plataforma corporativa de gestão jurídica com controle de processos, clientes, prazos e inteligência processual.",
    siteName: "Davino Neves Advocacia",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Davino Neves Advocacia | Gestão Jurídica",
    description: "Plataforma corporativa de gestão jurídica com controle de processos, clientes, prazos e inteligência processual.",
  },
  robots: {
    index: false,
    follow: false,
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
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="system"
            toastOptions={{
              className: "text-xs font-medium rounded-xl shadow-lg border border-slate-200 dark:border-slate-800",
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
