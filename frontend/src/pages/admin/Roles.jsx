import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";

export default function Roles() {
  return (
    <ResourcePage
      title="Roles"
      eyebrow="Admin"
      api={api.roles}
      createLabel="Create role"
      initialForm={{ name: "", description: "" }}
      columns={[
        { key: "name", label: "Name" },
        { key: "description", label: "Description" },
      ]}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}

