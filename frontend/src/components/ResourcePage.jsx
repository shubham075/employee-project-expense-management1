import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { queryString } from "../utils/format";
import Button from "./ui/Button";
import DataTable from "./ui/DataTable";
import { ErrorText, Field, FormGrid } from "./ui/FormGrid";
import Modal from "./ui/Modal";
import PageHeader from "./ui/PageHeader";
import ResourceToolbar from "./ui/ResourceToolbar";

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "uppercase", label: "At least one uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "At least one lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "number", label: "At least one number", test: (p) => /\d/.test(p) },
  { id: "special", label: "At least one special character", test: (p) => /[!@#$%^&*]/.test(p) },
];

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
      {modal && <FormModal modal={modal} onClose={() => setModal(null)} fields={fields} form={form} setForm={setForm} onSubmit={handleSubmit} createLabel={createLabel} title={title} error={error} />}
    </>
  );
}

function Input({ field, value, onChange, isCreating }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPolicyHint, setShowPolicyHint] = useState(false);

  const isPasswordField = field.type === "password" && isCreating;
  
  const passwordChecks = isPasswordField
    ? PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        met: req.test(value),
      }))
    : [];

  const allRequirementsMet = passwordChecks.every((check) => check.met);

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

  const inputElement = (
    <div>
      <div className={isPasswordField ? "relative" : ""}>
        <input
          className={`field ${isPasswordField ? "pr-10" : ""}`}
          type={isPasswordField && !showPassword ? "password" : field.type || "text"}
          value={value}
          onChange={(event) => {
            const inputValue = event.target.value;
            if (field.number) {
              onChange(inputValue === "" ? "" : Number(inputValue));
            } else {
              onChange(inputValue);
            }
          }}
          onFocus={() => isPasswordField && setShowPolicyHint(true)}
          onBlur={() => isPasswordField && setTimeout(() => setShowPolicyHint(false), 200)}
          min={field.min}
          step={field.step}
          required={field.required}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {/* Password Policy Hint */}
      {isPasswordField && showPolicyHint && value && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${allRequirementsMet ? "bg-emerald-500" : "bg-amber-500"}`}></div>
            <p className="text-sm font-semibold text-slate-700">
              {allRequirementsMet ? "✓ Password meets all requirements" : "Password requirements"}
            </p>
          </div>
          <div className="space-y-2">
            {passwordChecks.map((check) => (
              <div key={check.id} className="flex items-center gap-2 text-sm">
                {check.met ? (
                  <CheckCircle2 className="text-emerald-500" size={16} />
                ) : (
                  <AlertCircle className="text-slate-300" size={16} />
                )}
                <span className={check.met ? "text-slate-600" : "text-slate-500"}>{check.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return inputElement;
}

function FormModal({ modal, onClose, fields, form, setForm, onSubmit, createLabel, title, error }) {
  // Check if form is valid for submission
  function isFormValid() {
    // Check if creating user - need password validation
    if (modal.mode === "create" && title === "Users") {
      // Check all required fields are filled
      for (const field of fields) {
        const value = form[field.name];
        if (field.required && (value === "" || value === null || value === undefined)) {
          return false;
        }
      }
      
      // Check password meets all requirements
      const passwordField = fields.find(f => f.type === "password");
      if (passwordField) {
        const passwordValue = form[passwordField.name] || "";
        const passwordChecks = PASSWORD_REQUIREMENTS.map((req) => ({
          ...req,
          met: req.test(passwordValue),
        }));
        return passwordChecks.every((check) => check.met);
      }
      
      return true;
    }
    
    // For other operations, check required fields
    for (const field of fields) {
      const value = form[field.name];
      if (field.required && (value === "" || value === null || value === undefined)) {
        return false;
      }
    }
    
    return true;
  }

  return (
    <Modal title={modal.mode === "create" ? createLabel : `Edit ${title}`} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <FormGrid>
          {fields.map((field) => (
            <Field key={field.name} label={field.label}>
              <Input 
                field={field} 
                value={form[field.name] ?? ""} 
                onChange={(value) => setForm({ ...form, [field.name]: value })} 
                isCreating={modal.mode === "create"}
              />
            </Field>
          ))}
        </FormGrid>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!isFormValid()}>
            <Save size={17} />
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

