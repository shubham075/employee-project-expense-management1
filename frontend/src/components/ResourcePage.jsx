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

const validators = {
  alphaSpace: (value) => (!value || /^[A-Za-z ]+$/.test(value) ? "" : "Only alphabets and spaces are allowed."),
  alphaOnly: (value) => (!value || /^[A-Za-z]+$/.test(value) ? "" : "Only alphabets are allowed."),
  enterpriseEmail: (value) => {
    if (!value) return "";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(value)) return "Enter a valid email address.";
    const domain = value.split("@")[1]?.toLowerCase();
    const publicDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com", "icloud.com", "aol.com", "proton.me", "protonmail.com"];
    return publicDomains.includes(domain) ? "Use an enterprise/work email address." : "";
  },
  integer: (value) => {
    if (value === "" || value === null || value === undefined) return "";
    return /^\d+$/.test(String(value)) ? "" : "Only numeric integer values are allowed.";
  },
  minLength: (value, field) => {
    if (!value) return "";
    return String(value).trim().length >= field.minLength ? "" : `Minimum ${field.minLength} characters required.`;
  },
  maxLength: (value, field) => {
    if (!value) return "";
    return String(value).length <= field.maxLength ? "" : `Maximum ${field.maxLength} characters allowed.`;
  },
  minDateToday: (value) => {
    if (!value) return "";
    return value >= todayString() ? "" : "Date cannot be before today.";
  },
  maxDateOneYear: (value) => {
    if (!value) return "";
    return value <= oneYearFromTodayString() ? "" : "Date cannot be more than 1 year from today.";
  },
  minDateField: (value, field, form) => {
    if (!value || !form[field.minDateField]) return "";
    return value >= form[field.minDateField] ? "" : `Date cannot be before ${field.minDateLabel || "the start date"}.`;
  },
};

function todayString() {
  return formatDateInputValue(new Date());
}

function oneYearFromTodayString() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return formatDateInputValue(date);
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
    const fieldsByName = Object.fromEntries(fields.map((field) => [field.name, field]));
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => {
        const field = fieldsByName[key];
        // Convert empty strings to null for optional fields
        if (value === "" || (typeof value === "number" && isNaN(value))) {
          if (field?.sendNullOnEmpty) {
            return [key, null];
          }
          return [key, null];
        }
        return [key, value];
      }).filter(([key, value]) => value !== undefined && (value !== null || fieldsByName[key]?.sendNullOnEmpty)),
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
    return (
      <textarea
        className="field min-h-24"
        value={value}
        minLength={field.minLength}
        maxLength={field.maxLength}
        required={field.required}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select
        className="field"
        value={value}
        onChange={(event) => onChange(field.number && event.target.value !== "" ? Number(event.target.value) : event.target.value)}
      >
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
          max={field.max}
          step={field.step}
          maxLength={field.maxLength}
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
  const [fieldErrors, setFieldErrors] = useState({});

  function validateField(field) {
    const value = form[field.name];
    const isRequired = field.required || (field.requiredOnCreate && modal.mode === "create") || (field.requiredOnEdit && modal.mode === "edit");
    if (isRequired && (value === "" || value === null || value === undefined || (typeof value === "string" && value.trim() === ""))) {
      return `${field.label} is required.`;
    }
    if (field.type === "password" && modal.mode === "create") {
      const passwordValue = value || "";
      const failedRequirement = PASSWORD_REQUIREMENTS.find((req) => !req.test(passwordValue));
      if (failedRequirement) return failedRequirement.label;
    }
    for (const rule of field.validators || []) {
      const validator = typeof rule === "string" ? validators[rule] : validators[rule.name];
      const message = validator?.(value, { ...field, ...rule }, form);
      if (message) return message;
    }
    return "";
  }

  function validateForm() {
    const nextErrors = {};
    fields.forEach((field) => {
      const message = validateField(field);
      if (message) nextErrors[field.name] = message;
    });
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function getFormErrors() {
    return fields.reduce((errors, field) => {
      const message = validateField(field);
      return message ? { ...errors, [field.name]: message } : errors;
    }, {});
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    onSubmit(event);
  }

  const hasValidationErrors = Object.keys(getFormErrors()).length > 0;

  function updateField(field, value) {
    const nextForm = { ...form, [field.name]: value };
    if (field.name === "start_date" && nextForm.end_date && nextForm.end_date < value) {
      nextForm.end_date = value;
    }
    setForm(nextForm);
    if (fieldErrors[field.name]) {
      setFieldErrors({ ...fieldErrors, [field.name]: "" });
    }
  }

  return (
    <Modal title={modal.mode === "create" ? createLabel : `Edit ${title}`} onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormGrid>
          {fields.map((field) => {
            const computedField = {
              ...field,
              min: field.min || (field.validators?.includes("minDateToday") ? todayString() : undefined) || (field.minDateField ? form[field.minDateField] : undefined),
              max: field.max || (field.validators?.includes("maxDateOneYear") ? oneYearFromTodayString() : undefined),
            };
            return (
              <Field key={field.name} label={field.label} error={fieldErrors[field.name]}>
                <Input
                  field={computedField}
                  value={form[field.name] ?? ""}
                  onChange={(value) => updateField(field, value)}
                  isCreating={modal.mode === "create"}
                />
              </Field>
            );
          })}
        </FormGrid>
        <ErrorText>{error}</ErrorText>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={hasValidationErrors}>
            <Save size={17} />
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

