export default function StatusBadge({ value }) {
  const normalized = String(value || "").toLowerCase();
  const classes = {
    active: "bg-teal-50 text-teal-700",
    approved: "bg-teal-50 text-teal-700",
    done: "bg-teal-50 text-teal-700",
    pending: "bg-amber-50 text-amber-700",
    todo: "bg-slate-100 text-slate-700",
    "in-progress": "bg-sky-50 text-sky-700",
    rejected: "bg-red-50 text-red-700",
  };
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${classes[normalized] || "bg-slate-100 text-slate-700"}`}>
      {value || "unknown"}
    </span>
  );
}

