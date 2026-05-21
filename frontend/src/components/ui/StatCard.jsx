export default function StatCard({ label, value, icon: Icon, tone = "teal" }) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    coral: "bg-red-50 text-coral",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="panel flex items-center justify-between p-5">
      <div>
        <p className="label">{label}</p>
        <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
      </div>
      {Icon ? (
        <div className={`flex h-12 w-12 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      ) : null}
    </div>
  );
}

