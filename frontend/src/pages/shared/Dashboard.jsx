import { BarChart3, Briefcase, ClipboardCheck, CreditCard, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "../../api/client";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import { money } from "../../utils/format";

export default function Dashboard({ role = "Admin" }) {
  const [summary, setSummary] = useState(null);
  const [expenseRows, setExpenseRows] = useState([]);

  useEffect(() => {
    api.reports.dashboard().then(setSummary).catch(() => setSummary(null));
    api.reports.expenses().then(setExpenseRows).catch(() => setExpenseRows([]));
  }, []);

  const cards = [
    { label: "Users", value: summary?.total_users ?? "-", icon: Users, tone: "slate" },
    { label: "Projects", value: summary?.total_projects ?? "-", icon: Briefcase, tone: "teal" },
    { label: "Open tasks", value: summary?.open_tasks ?? "-", icon: ClipboardCheck, tone: "amber" },
    { label: "Pending expenses", value: summary?.pending_expenses ?? "-", icon: CreditCard, tone: "coral" },
  ];

  return (
    <>
      <PageHeader title={`${role} dashboard`} eyebrow="Overview" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Approved expense value</h2>
            <BarChart3 className="text-teal-700" size={20} />
          </div>
          <p className="text-5xl font-black text-ink">{money(summary?.approved_expense_total)}</p>
          <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-2/3 rounded-full bg-teal-700" />
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-bold text-ink">Expense status</h2>
          <div className="space-y-3">
            {expenseRows.map((row) => (
              <div key={row.status} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span className="text-sm font-semibold capitalize text-slate-700">{row.status}</span>
                <span className="text-sm font-bold text-ink">{money(row.total_amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

