import { useEffect, useState } from "react";
import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";
import StatusBadge from "../../components/ui/StatusBadge";
import { date } from "../../utils/format";

export default function ProjectsPage({ role = "Admin", canDelete = false }) {
  const [managerOptions, setManagerOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchManagers() {
      try {
        const result = await api.users.list("?size=100");
        const managers = result?.items || [];
        setManagerOptions([
          { value: "", label: "None" },
          ...managers.map((user) => ({
            value: user.id,
            label: user.full_name,
          })),
        ]);
      } catch (error) {
        console.error("Failed to fetch managers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchManagers();
  }, []);

  if (loading) return <div className="py-8 text-sm text-slate-500">Loading...</div>;

  return (
    <ResourcePage
      title="Projects"
      eyebrow={role}
      api={api.projects}
      createLabel="Create project"
      canDelete={canDelete}
      initialForm={{ name: "", description: "", status: "on-hold", start_date: "", end_date: "", manager_id: "" }}
      columns={[
        { key: "name", label: "Project" },
        { key: "status", label: "Status", render: (row) => <StatusBadge value={row.status} /> },
        {
          key: "manager_id",
          label: "Manager",
          render: (row) => managerOptions.find((option) => String(option.value) === String(row.manager_id))?.label || "None",
        },
        { key: "start_date", label: "Start", render: (row) => date(row.start_date) },
        { key: "end_date", label: "End", render: (row) => date(row.end_date) },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "status", label: "Status", type: "select", options: statusOptions, required: true },
        { name: "manager_id", label: "Manager", type: "select", options: managerOptions, requiredOnCreate: true, sendNullOnEmpty: true },
        { name: "start_date", label: "Start date", type: "date", required: true, validators: ["minDateToday", "maxDateOneYear"] },
        { name: "end_date", label: "End date", type: "date", required: true, minDateField: "start_date", minDateLabel: "start date", validators: ["minDateField", "maxDateOneYear"] },
        { name: "description", label: "Description", type: "textarea", required: true, minLength: 100, validators: [{ name: "minLength", minLength: 100 }] },
      ]}
    />
  );
}

const statusOptions = [
  { value: "on-hold", label: "On Hold" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

