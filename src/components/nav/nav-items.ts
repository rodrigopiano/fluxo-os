import type { LucideIcon } from "lucide-react";
import {
  Home,
  ArrowLeftRight,
  Wallet,
  CreditCard,
  Receipt,
  HandCoins,
  TrendingUp,
  Target,
  Sparkles,
  Settings,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Hoje", icon: Home },
  { href: "/lancamentos", label: "Lançamentos", icon: ArrowLeftRight },
  { href: "/contas", label: "Contas", icon: Wallet },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/cartoes", label: "Cartões", icon: CreditCard },
  { href: "/contas-a-pagar", label: "Contas a pagar", icon: Receipt },
  { href: "/contas-a-receber", label: "Contas a receber", icon: HandCoins },
];

export const COMING_SOON_NAV: NavItem[] = [
  { href: "#", label: "Patrimônio", icon: TrendingUp, comingSoon: true },
  { href: "#", label: "Metas", icon: Target, comingSoon: true },
  { href: "#", label: "Consultora IA", icon: Sparkles, comingSoon: true },
  { href: "#", label: "Configurações", icon: Settings, comingSoon: true },
];
