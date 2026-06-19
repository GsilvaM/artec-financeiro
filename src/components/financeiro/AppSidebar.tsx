import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  useSidebar,
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
  const { setOpenMobile } = useSidebar();
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return (
    <Sidebar collapsible="icon" className="bg-sidebar-gradient border-r border-white/5">
      <SidebarHeader className="flex items-center gap-3 border-b border-white/10 px-4 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 ring-2 ring-white/20 logo-glow">
          <img src="/logo_artec.png" alt="Artec" className="h-7 w-7 rounded-full object-cover" />
        </div>
        <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
          <span className="text-sm font-semibold text-white">Artec</span>
          <span className="text-[10px] text-white/50 tracking-wide uppercase">Financeiro</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="relative mx-2 rounded-lg data-[active=true]:bg-white/10 data-[active=true]:shadow-sm"
                      onMouseEnter={() => setHoveredItem(item.url)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-3 py-2 group">
                        {active && (
                          <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary-light to-primary shadow-md" />
                        )}
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
                          active
                            ? "bg-primary/20 text-primary-light"
                            : "text-white/60 group-hover:bg-white/10 group-hover:text-white"
                        }`}>
                          <Icon className={`h-[18px] w-[18px] transition-transform duration-200 ${
                            hoveredItem === item.url ? "scale-110" : ""
                          }`} />
                        </div>
                        <span className={`text-sm font-medium transition-colors duration-200 ${
                          active ? "text-white" : "text-white/70 group-hover:text-white"
                        }`}>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <div className="mt-auto border-t border-white/5 px-4 py-3 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
          <span className="text-xs text-white/40">Sistema ativo</span>
        </div>
      </div>
    </Sidebar>
  );
}
