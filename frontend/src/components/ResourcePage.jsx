import { Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { queryString } from "../utils/format";
import Button from "./ui/Button";
import DataTable from "./ui/DataTable";
import { ErrorText, Field, FormGrid } from "./ui/FormGrid";
import Modal from "./ui/Modal";
import PageHeader from "./ui/PageHeader";
import ResourceToolbar from "./ui/ResourceToolbar";

export default function ResourcePage({
  title,
  eyebrow,
  api,
  columns,
  fields,
  createLabel,
  initialForm,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  queryDefaults = {},
  rowActions,
}) {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 0 });
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const query = useMemo(
    () => queryString({ page: 1, size: 20, search, sort_by: "id", sort_order: "desc", ...queryDefaults }),
    [search, queryDefaults],
  );

  async function load() {
    setLoading(true);
    try {
      const result = await api.list(query);
      setRows(result?.items || []);
      setMeta(result?.meta || { total: 0, page: 1, pages: 0 });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [query]);

  function openCreate() {
    setError("");
    setForm(initialForm);
    setModal({ mode: "create" });
  }

  function openEdit(row) {
    setError("");
    setForm({ ...initialForm, ...row, password: "" });
    setModal({ mode: "edit", row });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => {
        // Convert empty strings to null for optional fields
        if (value === "" || (typeof value === "number" && isNaN(value))) {
          return [key, null];
        }
        return [key, value];
      }).filter(([, value]) => value !== null && value !== undefined),
    );
    try {
      if (modal.mode === "create") {
        await api.create(payload);
      } else {
        await api.update(modal.row.id, payload);
      }
      setModal(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(row) {
    if (!window.confirm(`Delete ${row.name || row.title || row.full_name || "record"}?`)) return;
    await api.remove(row.id);
    await load();
  }

  const tableColumns = rowActions ? [...columns, rowActions(load)] : columns;

  return (
    <>
      <PageHeader title={title} eyebrow={eyebrow} />
      <ResourceToolbar search={search} onSearch={setSearch} onCreate={canCreate ? openCreate : null} createLabel={createLabel} />
      {loading ? <p className="py-8 text-sm text-slate-500">Loading...</p> : null}
      <DataTable columns={tableColumns} rows={rows} onEdit={canEdit ? openEdit : null} onDelete={canDelete ? handleDelete : null} />
      <p className="mt-3 text-sm text-slate-500">
        {meta.total} records · page {meta.page || 1} of {meta.pages || 1}
      </p>
      {modal && (
        <Modal title={modal.mode === "create" ? createLabel : `Edit ${title}`} onClose={() => setModal(null)}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <ErrorText>{error}</ErrorText>
            <FormGrid>
              {fields.map((field) => (
                <Field key={field.name} label={field.label}>
                  <Input field={field} value={form[field.name] ?? ""} onChange={(value) => setForm({ ...form, [field.name]: value })} />
                </Field>
              ))}
            </FormGrid>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModal(null)}>
                Cancel
              </Button>
              <Button>
                <Save size={17} />
                Save
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

function Input({ field, value, onChange }) {
  if (field.type === "textarea") {
    return <textarea className="field min-h-24" value={value} onChange={(event) => onChange(event.target.value)} />;
  }
  if (field.type === "select") {
    return (
      <select className="field" value={value} onChange={(event) => onChange(field.number ? Number(event.target.value) : event.target.value)}>
        <option value="">Select</option>
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      className="field"
      type={field.type || "text"}
      value={value}
      onChange={(event) => {
        const inputValue = event.target.value;
        if (field.number) {
          // For number fields, keep empty string for optional fields
          onChange(inputValue === "" ? "" : Number(inputValue));
        } else {
          onChange(inputValue);
        }
      }}
      min={field.min}
      step={field.step}
      required={field.required}
    />
  );
}

