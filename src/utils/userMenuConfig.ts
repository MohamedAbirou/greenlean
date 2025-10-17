import type { LucideProps } from "lucide-react";
import {
  Camera,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Trophy,
  Users,
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
        to: "/profile",
        shortcut: "CTRL+ALT+PS",
      },
      {
        icon: History,
        label: "Quiz History",
        to: "/quiz-history",
        shortcut: "CTRL+ALT+Q",
      },
      {
        icon: Camera,
        label: "Progress Photos",
        to: "/progress-photos",
        shortcut: "CTRL+ALT+P",
      },
    ],
  },
  {
    label: "Community",
    items: [
      { icon: Users, label: "Community", to: "/community", shortcut: "CTRL+ALT+CM" },
      {
        icon: Trophy,
        label: "Challenges",
        to: "/challenges",
        shortcut: "CTRL+ALT+CC",
      },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: LogOut, label: "Sign Out", action: "signout", shortcut: "CTRL+ALT+S" },
    ],
  },
];
