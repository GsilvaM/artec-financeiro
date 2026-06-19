import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Receipt, FileText, BarChart3, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Lançamentos", url: "/lancamentos", icon: Receipt },
  { title: "DRE Mensal", url: "/dre", icon: FileText },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex items-center gap-3 border-b border-sidebar-border px-4 py-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        <img src="/logo_artec.png" alt="Artec" className="h-8 w-auto shrink-0" />
        <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
          <span className="text-sm font-semibold text-sidebar-foreground">Artec</span>
          <span className="text-[10px] text-sidebar-foreground/60">Financeiro</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="relative"
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-sidebar-primary max-sm:hidden group-data-[collapsible=icon]:hidden" />
                        )}
                        <item.icon className="h-[18px] w-[18px]" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
