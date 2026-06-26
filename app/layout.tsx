import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Scale, LayoutDashboard, FileSearch, History } from "lucide-react";

export const metadata: Metadata = {
  title: "MultaIA - Análise de Multas",
  description: "Recorra das suas multas de forma automatizada",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR">
        <body>
          <nav className="navbar">
            <div className="container navbar-inner">
              <Link href="/" className="nav-brand">
                <Scale size={24} className="text-primary" />
                <span>MultaIA</span>
              </Link>

              <div className="nav-links">
                <Link href="/dashboard" className="nav-link">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <Link href="/" className="nav-link">
                  <FileSearch size={16} /> Analisar
                </Link>
                <Link href="/history" className="nav-link">
                  <History size={16} /> Histórico
                </Link>
              </div>

              <div className="nav-auth">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="font-semibold text-primary">Entrar</button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </nav>

          <main className="main-wrapper">
            <div className="container">
              {children}
            </div>
          </main>

          <footer className="footer">
            <div className="container">
              &copy; 2026 MultaIA. Todos os direitos reservados.
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
