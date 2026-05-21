import { useAuth } from "../../auth/AuthContext";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

export default function Profile() {
  const { user, role } = useAuth();

  return (
    <>
      <PageHeader title="Profile" eyebrow={role} />
      <Card className="max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-teal-700 text-xl font-black text-white">
            {(user?.full_name || "U").slice(0, 1)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">{user?.full_name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          <Info label="Username" value={user?.username} />
          <Info label="Role" value={user?.role?.name} />
          <Info label="User ID" value={user?.id} />
          <Info label="Manager ID" value={user?.manager_id || "-"} />
        </dl>
      </Card>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <dt className="label">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

