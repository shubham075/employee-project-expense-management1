import { useEffect, useState } from "react";

import { api } from "../../api/client";
import DataTable from "../../components/ui/DataTable";
import PageHeader from "../../components/ui/PageHeader";
import { money } from "../../utils/format";

export default function Reports() {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.reports.expenses().then(setExpenses);
    api.reports.projects().then(setProjects);
  }, []);

  return (
    <>
      <PageHeader title="Reports" eyebrow="Admin" />
      <div className="grid gap-6 xl:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">Expenses</h2>
          <DataTable
            rows={expenses.map((row, index) => ({ id: index + 1, ...row }))}
            columns={[
              { key: "status", label: "Status" },
              { key: "count", label: "Count" },
              { key: "total_amount", label: "Total", render: (row) => money(row.total_amount) },
            ]}
          />
        </section>
        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">Projects</h2>
          <DataTable
            rows={projects.map((row) => ({ id: row.project_id, ...row }))}
            columns={[
              { key: "project_name", label: "Project" },
              { key: "task_count", label: "Tasks" },
              { key: "expense_total", label: "Expenses", render: (row) => money(row.expense_total) },
            ]}
          />
        </section>
      </div>
    </>
  );
}

