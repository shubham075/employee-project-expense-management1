export default function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-teal-700 text-white hover:bg-teal-800 focus:ring-teal-200",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-200",
    danger: "bg-coral text-white hover:bg-red-600 focus:ring-red-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-200",
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

