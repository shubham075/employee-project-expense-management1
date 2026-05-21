export function FormGrid({ children }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label mb-1 block">{label}</span>
      {children}
    </label>
  );
}

export function ErrorText({ children }) {
  if (!children) return null;
  return <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{children}</p>;
}

export function SuccessText({ children }) {
  if (!children) return null;
  return <p className="rounded-md bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700">{children}</p>;
}
