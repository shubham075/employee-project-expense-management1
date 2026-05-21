import { Edit, Trash2 } from "lucide-react";

import Button from "./Button";

export default function DataTable({ columns, rows, onEdit, onDelete, empty = "No records found" }) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-normal text-slate-500">
                  {column.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="w-28 px-4 py-3 text-right text-xs font-bold uppercase tracking-normal text-slate-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm text-slate-700">
                      {column.render ? column.render(row) : row[column.key] ?? "-"}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {onEdit && (
                          <Button variant="ghost" className="h-9 w-9 p-0" onClick={() => onEdit(row)} title="Edit">
                            <Edit size={16} />
                          </Button>
                        )}
                        {onDelete && (
                          <Button variant="ghost" className="h-9 w-9 p-0 text-red-600" onClick={() => onDelete(row)} title="Delete">
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-sm text-slate-500">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

