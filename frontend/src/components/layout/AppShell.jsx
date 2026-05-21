import { LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { navByRole } from "../../utils/routes";
import Button from "../ui/Button";

export default function AppShell() {
  const [open, setOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = navByRole[role] || [];

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-mist">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-700 text-sm font-black text-white">EP</div>
          <div>
            <p className="text-sm font-bold text-ink">EmployeeOps</p>
            <p className="text-xs text-slate-500">Projects & Expenses</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                    isActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-100 hover:text-ink"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {open && <button className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <Button variant="ghost" className="h-10 w-10 p-0 lg:hidden" onClick={() => setOpen(true)} title="Menu">
            <Menu size={20} />
          </Button>
          <div className="hidden text-sm text-slate-500 sm:block">
            <span className="font-semibold text-ink">{role}</span> workspace
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 rounded-md px-2 py-1.5 transition hover:bg-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <User size={17} />
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-ink">{user?.full_name || "User"}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </button>
            <Button variant="secondary" className="h-10 w-10 p-0" onClick={handleLogout} title="Logout">
              <LogOut size={17} />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

