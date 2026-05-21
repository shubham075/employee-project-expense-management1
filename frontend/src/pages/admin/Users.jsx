import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";
import StatusBadge from "../../components/ui/StatusBadge";

export default function Users() {
  return (
    <ResourcePage
      title="Users"
      eyebrow="Admin"
      api={api.users}
      createLabel="Create user"
      initialForm={{ email: "", username: "", full_name: "", password: "", role_id: "", manager_id: "", is_active: true }}
      columns={[
        { key: "full_name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", render: (row) => row.role?.name || row.role_id },
        { key: "is_active", label: "Status", render: (row) => <StatusBadge value={row.is_active ? "active" : "inactive"} /> },
      ]}
      fields={[
        { name: "full_name", label: "Full name", required: true },
        { name: "username", label: "Username", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "password", label: "Password", type: "password" },
        { name: "role_id", label: "Role ID", type: "number", number: true, required: true },
        { name: "manager_id", label: "Manager ID", type: "number", number: true },
      ]}
    />
  );
}

