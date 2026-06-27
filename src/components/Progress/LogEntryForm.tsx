import { useState } from "react";
import type { ExerciseLogEntry } from "../../types";

interface Props {
  onAdd: (entry: ExerciseLogEntry) => void;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function LogEntryForm({ onAdd }: Props) {
  const [date, setDate] = useState(today());
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = parseInt(sets), r = parseInt(reps), w = parseFloat(weight);
    if (!date || isNaN(s) || isNaN(r) || isNaN(w)) return;
    onAdd({ date, sets: s, reps: r, weight: w });
    setSets("3"); setReps("10"); setWeight("");
  }

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none";
  const inputStyle = {
    background: "rgba(246,242,234,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "var(--cloud)",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--cloud-muted)" }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--cloud-muted)" }}>Weight (kg)</label>
          <input type="number" step="any" min="0" value={weight} onChange={e => setWeight(e.target.value)}
            placeholder="" className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--cloud-muted)" }}>Sets</label>
          <input type="number" min="1" value={sets} onChange={e => setSets(e.target.value)}
            className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: "var(--cloud-muted)" }}>Reps</label>
          <input type="number" min="1" value={reps} onChange={e => setReps(e.target.value)}
            className={inputCls} style={inputStyle} />
        </div>
      </div>
      <button
        type="submit"
        className="w-full py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
        style={{ background: "var(--terracotta)", color: "var(--cloud)" }}
      >
        Log set
      </button>
    </form>
  );
}
