import { useEffect, useState } from "react";
import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";
import StatusBadge from "../../components/ui/StatusBadge";

export default function Users() {
  const [managerOptions, setManagerOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [managersResult, rolesResult] = await Promise.all([
          api.users.list("?size=100"),
          api.roles.list("?size=100"),
        ]);

        const managers = managersResult?.items || [];
        setManagerOptions([
          { value: "", label: "None" },
          ...managers.map((user) => ({
            value: user.id,
            label: user.full_name,
          })),
        ]);

        const roles = rolesResult?.items || [];
        setRoleOptions(
          roles.map((role) => ({
            value: role.id,
            label: role.name,
          })),
        );
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="py-8 text-sm text-slate-500">Loading...</div>;

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
        { name: "role_id", label: "Role", type: "select", options: roleOptions, required: true },
        { name: "manager_id", label: "Manager", type: "select", options: managerOptions },
      ]}
    />
  );
}

