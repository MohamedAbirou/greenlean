import type { LucideProps } from "lucide-react";
import {
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Trophy
} from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type MenuIcon = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

export interface BaseMenuItem {
  icon: MenuIcon;
  label: string;
  shortcut: string;
  adminOnly?: boolean;
}

export interface LinkMenuItem extends BaseMenuItem {
  to: string;
}

export interface ActionMenuItem extends BaseMenuItem {
  action: string;
}

export type UserMenuItem = LinkMenuItem | ActionMenuItem;

export interface UserMenuGroup {
  label: string;
  items: UserMenuItem[];
}

export const userMenuGroups: UserMenuGroup[] = [
  {
    label: "Main",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        to: "/dashboard",
        shortcut: "CTRL+ALT+D",
      },
      {
        icon: Shield,
        label: "Admin Dashboard",
        to: "/admin",
        shortcut: "CTRL+ALT+A",
        adminOnly: true,
      },
      {
        icon: Settings,
        label: "Profile Settings",
        to: "/profile/settings",
        shortcut: "CTRL+ALT+P",
      },
      {
        icon: History,
        label: "Quiz History",
        to: "/quiz-history",
        shortcut: "CTRL+ALT+Q",
      },
      {
        icon: Trophy,
        label: "Challenges",
        to: "/challenges",
        shortcut: "CTRL+ALT+CC",
      }
    ],
  },
  {
    label: "Account",
    items: [
      { icon: LogOut, label: "Sign Out", action: "signout", shortcut: "CTRL+ALT+S" },
    ],
  },
];
