import { CheckCheck } from "lucide-react";

import { api } from "../../api/client";
import ResourcePage from "../../components/ResourcePage";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import { date } from "../../utils/format";

export default function Notifications() {
  return (
    <ResourcePage
      title="Notifications"
      eyebrow="Shared"
      api={api.notifications}
      createLabel="Create notification"
      canDelete={false}
      initialForm={{ user_id: "", title: "", message: "", notification_type: "info" }}
      columns={[
        { key: "title", label: "Title" },
        { key: "notification_type", label: "Type" },
        { key: "read_at", label: "Status", render: (row) => <StatusBadge value={row.read_at ? "read" : "unread"} /> },
        { key: "created_at", label: "Created", render: (row) => date(row.created_at) },
      ]}
      fields={[
        { name: "user_id", label: "User ID", type: "number", number: true, required: true },
        { name: "title", label: "Title", required: true },
        { name: "notification_type", label: "Type" },
        { name: "message", label: "Message", type: "textarea", required: true },
      ]}
      rowActions={(reload) => ({
        key: "mark",
        label: "Read",
        render: (row) => (
          <Button
            variant="secondary"
            className="h-9 px-3"
            disabled={Boolean(row.read_at)}
            onClick={async () => {
              await api.notifications.markRead(row.id);
              await reload();
            }}
          >
            <CheckCheck size={15} />
            Read
          </Button>
        ),
      })}
    />
  );
}

