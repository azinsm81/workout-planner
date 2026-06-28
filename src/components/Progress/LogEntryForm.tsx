import { useState } from "react";
import type { ExerciseLogEntry } from "../../types";

interface Props {
  onAdd: (entries: ExerciseLogEntry[]) => void;
}

interface SetRow {
  sets: string;
  reps: string;
  weight: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function emptyRow(): SetRow {
  return { sets: "3", reps: "10", weight: "" };
}

export function LogEntryForm({ onAdd }: Props) {
  const [date, setDate] = useState(today());
  const [rows, setRows] = useState<SetRow[]>([emptyRow()]);

  function updateRow(i: number, field: keyof SetRow, value: string) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  }

  function addRow() {
    setRows(prev => [...prev, emptyRow()]);
  }

  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entries: ExerciseLogEntry[] = [];
    for (const row of rows) {
      const s = parseInt(row.sets), r = parseInt(row.reps), w = parseFloat(row.weight);
      if (!date || isNaN(s) || isNaN(r) || isNaN(w)) return;
      entries.push({ date, sets: s, reps: r, weight: w });
    }
    onAdd(entries);
    setRows([emptyRow()]);
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inputStyle = {
    background: "rgba(246,242,234,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "var(--cloud)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date row */}
      <div>
        <label className="block text-xs mb-1" style={{ color: "var(--cloud-muted)" }}>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className={inputCls} style={inputStyle} />
      </div>

      {/* Set rows */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 mb-1">
          {["Sets", "Reps", "Weight (kg)"].map(l => (
            <p key={l} className="text-xs" style={{ color: "var(--cloud-muted)" }}>{l}</p>
          ))}
        </div>

        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="grid grid-cols-3 gap-2 flex-1">
              <input type="number" min="1" value={row.sets}
                onChange={e => updateRow(i, "sets", e.target.value)}
                className={inputCls} style={inputStyle} />
              <input type="number" min="1" value={row.reps}
                onChange={e => updateRow(i, "reps", e.target.value)}
                className={inputCls} style={inputStyle} />
              <input type="number" step="any" min="0" value={row.weight} placeholder=""
                onChange={e => updateRow(i, "weight", e.target.value)}
                className={inputCls} style={inputStyle} />
            </div>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-sm shrink-0"
                style={{ color: "var(--cloud-muted)" }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add sets */}
      <button
        type="button"
        onClick={addRow}
        className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{ color: "var(--cloud-muted)" }}
      >
        <span>＋</span> Add set
      </button>

      {/* Submit */}
      <div className="pt-4">
        <button
          type="submit"
          className="w-full py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
          style={{ background: "var(--terracotta)", color: "var(--cloud)" }}
        >
          Log {rows.length > 1 ? `${rows.length} sets` : "set"}
        </button>
      </div>
    </form>
  );
}
