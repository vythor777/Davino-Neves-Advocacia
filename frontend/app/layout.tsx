import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "sonner";
import AppLayout from "@/components/AppLayout";

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

// Script inline para identificação instantânea do tema antes da hidratação do React (Zero FOUC)
const themeInitScript = `
(function() {
  try {
    var key = 'davino_neves_theme';
    var saved = localStorage.getItem(key);
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || (saved !== 'light' && prefersDark);
    var root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="h-full font-sans bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
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
        </ThemeProvider>
      </body>
    </html>
  );
}

