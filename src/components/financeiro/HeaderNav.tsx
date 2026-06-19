import { useState, useRef, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  ClipboardList,
  FileText,
  Settings,
  Bell,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown,
  UserCircle,
  Receipt,
  BarChart3,
  Target,
  Wrench,
  FolderTree,
  Building2,
  DollarSign,
  PieChart,
  Scale,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon?: React.ReactNode;
}

interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isGroup(e: NavEntry): e is NavGroup {
  return "items" in e;
}

const navItems: NavEntry[] = [
  { label: "Dashboard", to: "/", icon: <LayoutDashboard className="h-4 w-4" /> },
  {
    label: "Financeiro",
    icon: <DollarSign className="h-4 w-4" />,
    items: [
      { label: "Lançamentos", to: "/lancamentos", icon: <Receipt className="h-4 w-4" /> },
      { label: "Fluxo de Caixa", to: "/fluxo-caixa", icon: <TrendingUp className="h-4 w-4" /> },
      { label: "DRE", to: "/dre", icon: <FileText className="h-4 w-4" /> },
      { label: "Relatórios Financeiros", to: "/relatorios", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "Ponto de Equilíbrio", to: "/ponto-equilibrio", icon: <Scale className="h-4 w-4" /> },
    ],
  },
  {
    label: "Operacional",
    icon: <Wrench className="h-4 w-4" />,
    items: [
      { label: "Técnicos", to: "/tecnicos", icon: <Users className="h-4 w-4" /> },
      { label: "Produtividade", to: "/produtividade", icon: <ClipboardList className="h-4 w-4" /> },
      { label: "Rentabilidade", to: "/rentabilidade", icon: <PieChart className="h-4 w-4" /> },
      { label: "Serviços", to: "/servicos", icon: <Wrench className="h-4 w-4" /> },
    ],
  },
  {
    label: "Cadastros",
    icon: <FolderTree className="h-4 w-4" />,
    items: [
      { label: "Categorias", to: "/configuracoes", icon: <FolderTree className="h-4 w-4" /> },
      { label: "Centros de Custos", to: "/centros-custo", icon: <Building2 className="h-4 w-4" /> },
      { label: "Colaboradores", to: "/colaboradores", icon: <Users className="h-4 w-4" /> },
      { label: "Serviços", to: "/servicos-cadastro", icon: <ClipboardList className="h-4 w-4" /> },
    ],
  },
  {
    label: "Relatórios",
    icon: <FileText className="h-4 w-4" />,
    items: [
      { label: "Financeiros", to: "/relatorios", icon: <DollarSign className="h-4 w-4" /> },
      { label: "Operacionais", to: "/relatorios-operacionais", icon: <BarChart3 className="h-4 w-4" /> },
      { label: "Centros de Custos", to: "/relatorios-centros-custo", icon: <Building2 className="h-4 w-4" /> },
      { label: "Rentabilidade", to: "/rentabilidade", icon: <PieChart className="h-4 w-4" /> },
    ],
  },
  {
    label: "Configurações",
    icon: <Settings className="h-4 w-4" />,
    items: [
      { label: "Metas", to: "/metas", icon: <Target className="h-4 w-4" /> },
      { label: "Usuários", to: "/usuarios", icon: <UserCircle className="h-4 w-4" /> },
      { label: "Permissões", to: "/permissoes", icon: <Settings className="h-4 w-4" /> },
      { label: "Configurações Gerais", to: "/configuracoes", icon: <Settings className="h-4 w-4" /> },
    ],
  },
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, handler]);
}

function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useClickOutside(ref, () => setOpen(false));

  const isActive = group.items.some((item) =>
    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to),
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`nav-item flex items-center gap-1.5 ${isActive ? "nav-item-active" : ""}`}
      >
        {group.icon}
        <span>{group.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="dropdown-menu" style={{ left: "50%", transform: "translateX(-50%)" }}>
          {group.items.map((item, idx) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as any}
                className={`dropdown-item ${active ? "dropdown-item-active" : ""}`}
                onClick={() => setOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SimpleNavItem({ item }: { item: NavItem }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);

  return (
    <Link
      to={item.to as any}
      className={`nav-item flex items-center gap-1.5 ${active ? "nav-item-active" : ""}`}
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center h-9 w-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setOpen(false)} />
          <div className="mobile-menu-panel">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <img src="/logo_artec.png" alt="Artec" className="h-8 w-8 rounded-full" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Artec</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">Financeiro</div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-2">
              <div className="mobile-nav-section">Navegação</div>
              {navItems.map((entry) => {
                if (!isGroup(entry)) {
                  const active = isActive(entry.to);
                  return (
                    <Link
                      key={entry.to}
                      to={entry.to as any}
                      className={`mobile-nav-item ${active ? "mobile-nav-item-active" : ""}`}
                    >
                      {entry.icon}
                      <span>{entry.label}</span>
                    </Link>
                  );
                }
                return (
                  <div key={entry.label}>
                    <div className="mobile-nav-section">{entry.label}</div>
                    {entry.items.map((item) => {
                      const active = isActive(item.to);
                      return (
                        <Link
                          key={item.to}
                          to={item.to as any}
                          className={`mobile-nav-item ${active ? "mobile-nav-item-active" : ""}`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export function HeaderNav() {
  return (
    <header className="bg-header-gradient header-shadow fixed top-0 left-0 right-0 z-50 h-16">
      <div className="flex h-full items-center px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 mr-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/25">
            <img src="/logo_artec.png" alt="Artec" className="h-6 w-6 rounded-full object-cover" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-white leading-tight">Artec</div>
            <div className="text-[10px] text-white/50 uppercase tracking-wide leading-tight">Financeiro</div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center h-full">
          {navItems.map((entry) => {
            if (!isGroup(entry)) {
              return <SimpleNavItem key={entry.to} item={entry} />;
            }
            return <NavDropdown key={entry.label} group={entry} />;
          })}
        </nav>

        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button className="hidden sm:flex items-center justify-center h-9 w-9 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all relative">
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#EF4444] ring-1 ring-white" />
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/15">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-white/15 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="text-sm text-white/80 font-medium">Fred</div>
          </div>

          <button className="hidden sm:flex items-center justify-center h-9 w-9 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <LogOut className="h-4.5 w-4.5" />
          </button>

          {/* Mobile Menu Trigger */}
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
