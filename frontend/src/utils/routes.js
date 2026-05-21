import {
  BarChart3,
  Bell,
  Briefcase,
  ClipboardCheck,
  CreditCard,
  Gauge,
  Settings,
  Shield,
  User,
  Users,
} from "lucide-react";

export const navByRole = {
  Admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: Gauge },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Roles", path: "/admin/roles", icon: Shield },
    { label: "Projects", path: "/admin/projects", icon: Briefcase },
    { label: "Tasks", path: "/admin/tasks", icon: ClipboardCheck },
    { label: "Expenses", path: "/admin/expenses", icon: CreditCard },
    { label: "Reports", path: "/admin/reports", icon: BarChart3 },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  Manager: [
    { label: "Dashboard", path: "/manager/dashboard", icon: Gauge },
    { label: "Projects", path: "/manager/projects", icon: Briefcase },
    { label: "Tasks", path: "/manager/tasks", icon: ClipboardCheck },
    { label: "Expenses", path: "/manager/expenses", icon: CreditCard },
    { label: "Team", path: "/manager/team", icon: Users },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Profile", path: "/profile", icon: User },
  ],
  Employee: [
    { label: "Dashboard", path: "/employee/dashboard", icon: Gauge },
    { label: "Tasks", path: "/employee/tasks", icon: ClipboardCheck },
    { label: "Expenses", path: "/employee/expenses", icon: CreditCard },
    { label: "Notifications", path: "/notifications", icon: Bell },
    { label: "Profile", path: "/employee/profile", icon: User },
  ],
};

