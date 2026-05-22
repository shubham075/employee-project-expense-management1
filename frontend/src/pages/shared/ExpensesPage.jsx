import { Check, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";

import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import { date, money } from "../../utils/format";

export default function ExpensesPage({ role = "Admin", approver = false }) {
  const [projectOptions, setProjectOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const result = await api.projects.list("?size=100");
        const projects = result?.items || [];
        setProjectOptions([
          { value: "", label: "None" },
          ...projects.map((project) => ({
            value: project.id,
            label: `${project.name} (#${project.id})`,
          })),
        ]);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) return <div className="py-8 text-sm text-slate-500">Loading...</div>;

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
        { name: "amount", label: "Amount", type: "number", step: "1", min: "1", required: true, validators: ["integer"] },
        { name: "category", label: "Category", required: true },
        { name: "expense_date", label: "Expense date", type: "date", required: true },
        { name: "project_id", label: "Project", type: "select", options: projectOptions, number: true },
        { name: "description", label: "Description", type: "textarea", minLength: 100, validators: [{ name: "minLength", minLength: 100 }] },
      ]}
      rowActions={(reload) => ({
        key: "actions",
        label: "Flow",
        render: (row) => (
          <div className="flex gap-2">
            {approver && row.status === "pending" ? (
              <>
                <Button variant="success" className="h-9 w-9 p-0" onClick={async () => { await api.expenses.decide(row.id, "approved"); await reload(); }} title="Approve">
                  <Check size={15} />
                </Button>
                <Button variant="danger" className="h-9 w-9 p-0" onClick={async () => { await api.expenses.decide(row.id, "rejected"); await reload(); }} title="Reject">
                  <X size={15} />
                </Button>
              </>
            ) : null}
            <label className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-teal-200 bg-teal-50 text-teal-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-100" title="Upload bill">
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
