import { Plus, Search } from "lucide-react";

import Button from "./Button";

export default function ResourceToolbar({ search, onSearch, onCreate, createLabel = "Create" }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={17} />
        <input
          className="field pl-9"
          placeholder="Search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      {onCreate && (
        <Button onClick={onCreate}>
          <Plus size={17} />
          {createLabel}
        </Button>
      )}
    </div>
  );
}

