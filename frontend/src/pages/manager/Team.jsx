import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";
import StatusBadge from "../../components/ui/StatusBadge";

export default function Team() {
  return (
    <ResourcePage
      title="Team"
      eyebrow="Manager"
      api={api.users}
      createLabel="Add team member"
      canCreate={false}
      canEdit={false}
      canDelete={false}
      initialForm={{}}
      columns={[
        { key: "full_name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", render: (row) => row.role?.name || row.role_id },
        { key: "is_active", label: "Status", render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
      ]}
      fields={[]}
    />
  );
}

