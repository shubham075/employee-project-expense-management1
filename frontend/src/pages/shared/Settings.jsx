import { useState } from "react";

import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { Field, SuccessText } from "../../components/ui/FormGrid";
import PageHeader from "../../components/ui/PageHeader";

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1");
  const [saved, setSaved] = useState(false);

  return (
    <>
      <PageHeader title="Settings" eyebrow="Workspace" />
      <Card className="max-w-2xl">
        <div className="space-y-4">
          <SuccessText>{saved ? "Settings saved locally" : ""}</SuccessText>
          <Field label="API base URL">
            <input className="field" value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} />
          </Field>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                localStorage.setItem("apiBaseUrl", apiUrl);
                setSaved(true);
              }}
            >
              Save settings
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
}

