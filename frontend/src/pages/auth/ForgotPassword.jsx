import { useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../../api/client";
import Button from "../../components/ui/Button";
import { ErrorText, SuccessText } from "../../components/ui/FormGrid";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const result = await api.auth.forgotPassword(email);
      setMessage(result?.reset_link || "Reset request accepted");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthPanel title="Reset access">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <ErrorText>{error}</ErrorText>
        <SuccessText>{message}</SuccessText>
        <label className="block">
          <span className="label mb-1 block">Email</span>
          <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <Button className="w-full">Send reset link</Button>
        <Link className="block text-center text-sm font-semibold text-teal-700" to="/login">
          Back to login
        </Link>
      </form>
    </AuthPanel>
  );
}

function AuthPanel({ title, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-4">
      <div className="panel w-full max-w-md p-6">
        <h1 className="mb-5 text-2xl font-bold text-ink">{title}</h1>
        {children}
      </div>
    </main>
  );
}

