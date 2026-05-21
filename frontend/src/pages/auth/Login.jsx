import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import Button from "../../components/ui/Button";
import { ErrorText } from "../../components/ui/FormGrid";

export default function Login() {
  const [form, setForm] = useState({ username_or_email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const home = await login(form);
      navigate(location.state?.from?.pathname || home, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-mist lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center px-6 py-12 sm:px-12 lg:px-20">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-teal-700 text-base font-black text-white">EP</div>
            <p className="label">EmployeeOps</p>
            <h1 className="mt-2 text-4xl font-bold text-ink">Welcome back</h1>
          </div>
          <form className="panel space-y-4 p-6" onSubmit={handleSubmit}>
            <ErrorText>{error}</ErrorText>
            <label className="block">
              <span className="label mb-1 block">Email or username</span>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={17} />
                <input
                  className="field pl-9"
                  value={form.username_or_email}
                  onChange={(event) => setForm({ ...form, username_or_email: event.target.value })}
                  required
                />
              </div>
            </label>
            <label className="block">
              <span className="label mb-1 block">Password</span>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-slate-400" size={17} />
                <input
                  className="field pl-9"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                />
              </div>
            </label>
            <div className="flex items-center justify-between text-sm">
              <Link className="font-semibold text-teal-700 hover:text-teal-800" to="/forgot-password">
                Forgot password
              </Link>
            </div>
            <Button className="w-full" disabled={submitting}>
              {submitting ? "Signing in" : "Sign in"}
            </Button>
          </form>
        </div>
      </section>
      <section className="hidden overflow-hidden bg-ink p-10 text-white lg:block">
        <div className="flex h-full flex-col justify-between rounded-md bg-[linear-gradient(135deg,#0f766e_0%,#172033_54%,#ee6f57_100%)] p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-white/70">Projects. Tasks. Expenses.</p>
            <h2 className="mt-5 max-w-xl text-5xl font-black leading-tight">A clean command center for teams that ship and spend carefully.</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {["Approvals", "Reports", "Audits"].map((item) => (
              <div key={item} className="rounded-md border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-sm font-bold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

