import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../../api/client";
import Button from "../../components/ui/Button";
import { ErrorText, SuccessText } from "../../components/ui/FormGrid";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [form, setForm] = useState({ token: tokenFromUrl, newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.auth.resetPassword(form.token, form.newPassword);
      setMessage("Password updated");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4">
      <form className="panel w-full max-w-md space-y-4 p-6" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-ink">Set new password</h1>
        <ErrorText>{error}</ErrorText>
        <SuccessText>{message}</SuccessText>
        <label className="block">
          <span className="label mb-1 block">Reset token</span>
          <input className="field" value={form.token} onChange={(event) => setForm({ ...form, token: event.target.value })} required />
        </label>
        <label className="block">
          <span className="label mb-1 block">New password</span>
          <input
            className="field"
            type="password"
            value={form.newPassword}
            onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
            required
            minLength={8}
          />
        </label>
        <Button className="w-full">Update password</Button>
        <Link className="block text-center text-sm font-semibold text-teal-700" to="/login">
          Back to login
        </Link>
      </form>
    </main>
  );
}

