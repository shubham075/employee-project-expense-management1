export default function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-teal-700 text-white shadow-sm hover:bg-teal-800 focus:ring-teal-200",
    secondary: "border border-slate-300 bg-white text-slate-800 shadow-sm hover:border-slate-400 hover:bg-slate-50 focus:ring-slate-200",
    action: "border border-teal-200 bg-teal-50 text-teal-800 shadow-sm hover:border-teal-300 hover:bg-teal-100 focus:ring-teal-100",
    success: "border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm hover:border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-100",
    danger: "border border-red-200 bg-red-50 text-red-700 shadow-sm hover:border-red-300 hover:bg-red-100 focus:ring-red-100",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-200",
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

