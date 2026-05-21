import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";

export default function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout().finally(() => navigate("/login", { replace: true }));
  }, [logout, navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700" />
    </main>
  );
}
