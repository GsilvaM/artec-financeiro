import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppSidebar } from "@/components/financeiro/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary-light hover:shadow-lg"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado. Tente novamente ou volte ao início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all duration-200 hover:bg-primary-light hover:shadow-lg"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-primary bg-white px-6 py-2.5 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/5"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Artec Financeiro" },
      {
        name: "description",
        content:
          "Sistema financeiro da Artec Ambientes Climatizados: lançamentos, DRE e relatórios.",
      },
      { name: "author", content: "Artec" },
      { property: "og:title", content: "Artec Financeiro" },
      {
        property: "og:description",
        content: "Controle financeiro — lançamentos, DRE e relatórios.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/logo_artec.png",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-white/10 bg-gradient-to-r from-[#2c3a5c] to-[#215797] px-4 shadow-lg shadow-[#215797]/10 backdrop-blur-none md:px-6">
              <SidebarTrigger className="rounded-lg text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold text-white/90 sm:text-sm">
                    Artec Ambientes Climatizados
                  </span>
                  <span className="hidden text-[10px] text-white/60 sm:block sm:text-xs">
                    Controle Financeiro
                  </span>
                </div>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <img src="/logo_artec.png" alt="Artec" className="h-8 w-auto sm:h-9" />
              </div>
            </header>
            <main className="flex-1 animate-fade-in p-3 sm:p-4 md:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </SidebarProvider>
    </QueryClientProvider>
  );
}
