import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";
import StatusBadge from "../../components/ui/StatusBadge";
import { date } from "../../utils/format";

export default function ProjectsPage({ role = "Admin", canDelete = false }) {
  return (
    <ResourcePage
      title="Projects"
      eyebrow={role}
      api={api.projects}
      createLabel="Create project"
      canDelete={canDelete}
      initialForm={{ name: "", description: "", status: "active", start_date: "", end_date: "", manager_id: "" }}
      columns={[
        { key: "name", label: "Project" },
        { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        { key: "manager_id", label: "Manager" },
        { key: "start_date", label: "Start", render: (row) => date(row.start_date) },
        { key: "end_date", label: "End", render: (row) => date(row.end_date) },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "status", label: "Status", type: "select", options: statusOptions },
        { name: "manager_id", label: "Manager ID", type: "number", number: true, required: true },
        { name: "start_date", label: "Start date", type: "date" },
        { name: "end_date", label: "End date", type: "date" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "on-hold", label: "On hold" },
  { value: "completed", label: "Completed" },
];

