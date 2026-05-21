import { CheckCircle2 } from "lucide-react";

import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import { date } from "../../utils/format";

export default function TasksPage({ role = "Admin", employee = false }) {
  return (
    <ResourcePage
      title="Tasks"
      eyebrow={role}
      api={api.tasks}
      createLabel="Assign task"
      canCreate={!employee}
      canEdit={!employee}
      canDelete={!employee}
      initialForm={{ title: "", description: "", status: "todo", priority: "medium", due_date: "", project_id: "", assigned_to_id: "" }}
      columns={[
        { key: "title", label: "Task" },
        { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        { key: "priority", label: "Priority" },
        { key: "project_id", label: "Project" },
        { key: "assigned_to_id", label: "Assignee" },
        { key: "due_date", label: "Due", render: (row) => date(row.due_date) },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "status", label: "Status", type: "select", options: taskStatuses },
        { name: "priority", label: "Priority", type: "select", options: priorities },
        { name: "project_id", label: "Project ID", type: "number", number: true, required: true },
        { name: "assigned_to_id", label: "Assigned to ID", type: "number", number: true, required: true },
        { name: "due_date", label: "Due date", type: "date" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      rowActions={(reload) => ({
        key: "quick",
        label: "Update",
        render: (row) => (
          <Button
            variant="secondary"
            className="h-9 px-3"
            onClick={async () => {
              await api.tasks.updateStatus(row.id, row.status === "done" ? "in-progress" : "done");
              await reload();
            }}
          >
            <CheckCircle2 size={15} />
            {row.status === "done" ? "Reopen" : "Done"}
          </Button>
        ),
      })}
    />
  );
}

const taskStatuses = [
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

