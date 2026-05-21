import { Check, Upload, X } from "lucide-react";

import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import { date, money } from "../../utils/format";

export default function ExpensesPage({ role = "Admin", approver = false }) {
  return (
    <ResourcePage
      title="Expenses"
      eyebrow={role}
      api={api.expenses}
      createLabel="Add expense"
      canDelete={role !== "Manager"}
      initialForm={{ title: "", description: "", amount: "", category: "", expense_date: "", project_id: "" }}
      columns={[
        { key: "title", label: "Expense" },
        { key: "amount", label: "Amount", render: (row) => money(row.amount) },
        { key: "category", label: "Category" },
        { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        { key: "expense_date", label: "Date", render: (row) => date(row.expense_date) },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "amount", label: "Amount", type: "number", step: "0.01", required: true },
        { name: "category", label: "Category", required: true },
        { name: "expense_date", label: "Expense date", type: "date", required: true },
        { name: "project_id", label: "Project ID", type: "number", number: true },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      rowActions={(reload) => ({
        key: "actions",
        label: "Flow",
        render: (row) => (
          <div className="flex gap-2">
            {approver && row.status === "pending" ? (
              <>
                <Button variant="secondary" className="h-9 w-9 p-0" onClick={async () => { await api.expenses.decide(row.id, "approved"); await reload(); }} title="Approve">
                  <Check size={15} />
                </Button>
                <Button variant="secondary" className="h-9 w-9 p-0 text-red-600" onClick={async () => { await api.expenses.decide(row.id, "rejected"); await reload(); }} title="Reject">
                  <X size={15} />
                </Button>
              </>
            ) : null}
            <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" title="Upload bill">
              <Upload size={15} />
              <input
                className="hidden"
                type="file"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    await api.expenses.uploadBill(row.id, file);
                    await reload();
                  }
                }}
              />
            </label>
          </div>
        ),
      })}
    />
  );
}
