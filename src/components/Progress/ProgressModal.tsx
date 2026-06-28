import { useState, useEffect, useRef } from "react";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
import type { Exercise, ExerciseLogEntry } from "../../types";
import { MUSCLE_GROUP_LABELS } from "../../data/exerciseLibrary.seed";
import { ProgressChart } from "./ProgressChart";
import { LogEntryForm } from "./LogEntryForm";

interface PendingUndo {
  entry: ExerciseLogEntry;
  originalIndex: number;
  timerId: ReturnType<typeof setTimeout>;
}

interface Props {
  exercise: Exercise;
  entries: ExerciseLogEntry[];
  onAdd: (entries: ExerciseLogEntry[]) => void;
  onUpdate: (entryIndex: number, entry: ExerciseLogEntry) => void;
  onDelete: (entryIndex: number) => void;
  onRestore: (entryIndex: number, entry: ExerciseLogEntry) => void;
  onClose: () => void;
}

export function ProgressModal({ exercise, entries, onAdd, onUpdate, onDelete, onRestore, onClose }: Props) {
  const regionColor = exercise.region === "upper" ? "var(--terracotta)" : "var(--plum)";
  const regionLabel = exercise.region === "upper" ? "Upper" : "Lower";

  // Sort descending for display; ascending for chart
  const sorted = [...entries]
    .map((e, originalIndex) => ({ ...e, originalIndex }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const [editingOriginalIndex, setEditingOriginalIndex] = useState<number | null>(null);
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
  const undoRef = useRef<PendingUndo | null>(null);

  // Keep ref in sync so cleanup in useEffect sees latest value
  useEffect(() => { undoRef.current = pendingUndo; }, [pendingUndo]);

  // Clear undo timer on unmount
  useEffect(() => () => { if (undoRef.current) clearTimeout(undoRef.current.timerId); }, []);

  function handleDelete(originalIndex: number) {
    const entry = entries[originalIndex];
    // Cancel any existing undo first
    if (pendingUndo) {
      clearTimeout(pendingUndo.timerId);
      setPendingUndo(null);
    }
    onDelete(originalIndex);
    const timerId = setTimeout(() => setPendingUndo(null), 5000);
    setPendingUndo({ entry, originalIndex, timerId });
  }

  function handleUndo() {
    if (!pendingUndo) return;
    clearTimeout(pendingUndo.timerId);
    onRestore(pendingUndo.originalIndex, pendingUndo.entry);
    setPendingUndo(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(30,27,41,0.72)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="glass-card w-full max-w-md flex flex-col"
        style={{ borderRadius: 24, padding: 0, overflow: "hidden", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: "1px solid var(--border-hairline)" }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-xl font-semibold" style={{ color: "var(--cloud)" }}>
                {exercise.name}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: regionColor }} />
                <span className="text-xs" style={{ color: "var(--cloud-muted)" }}>
                  {regionLabel} · {MUSCLE_GROUP_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full shrink-0 hover:bg-white/10 transition-colors"
              style={{ color: "var(--cloud-muted)" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}>
          <ProgressChart entries={entries} />

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--cloud-muted)" }}>
              Log a session
            </p>
            <LogEntryForm onAdd={onAdd} />
          </div>

          {(sorted.length > 0 || pendingUndo) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--cloud-muted)" }}>
                History
              </p>

              {/* Undo toast */}
              {pendingUndo && (
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-xl mb-1.5 text-sm"
                  style={{ background: "rgba(140,78,57,0.25)", border: "1px solid rgba(140,78,57,0.4)" }}
                >
                  <span style={{ color: "var(--cloud-muted)" }}>Entry deleted</span>
                  <button
                    onClick={handleUndo}
                    className="font-semibold text-xs px-2 py-0.5 rounded-full hover:bg-white/10 transition-colors"
                    style={{ color: "var(--cloud)" }}
                  >
                    Undo
                  </button>
                </div>
              )}

              <div className="space-y-1.5">
                {sorted.map((row, i) => (
                  editingOriginalIndex === row.originalIndex ? (
                    <EditRow
                      key={i}
                      entry={row}
                      onSave={updated => { onUpdate(row.originalIndex, updated); setEditingOriginalIndex(null); }}
                      onCancel={() => setEditingOriginalIndex(null)}
                    />
                  ) : (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-sm group/row"
                      style={{ background: "rgba(246,242,234,0.06)" }}
                    >
                      <span style={{ color: "var(--cloud-muted)" }}>{formatDate(row.date)}</span>
                      <span style={{ color: "var(--cloud)" }}>
                        {row.sets}×{row.reps} @ {row.weight}kg
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <button
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-xs transition-colors"
                          style={{ color: "var(--cloud-muted)" }}
                          onClick={() => setEditingOriginalIndex(row.originalIndex)}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-xs transition-colors"
                          style={{ color: "var(--cloud-muted)" }}
                          onClick={() => handleDelete(row.originalIndex)}
                          title="Delete"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface EditRowProps {
  entry: ExerciseLogEntry & { originalIndex: number };
  onSave: (entry: ExerciseLogEntry) => void;
  onCancel: () => void;
}

function EditRow({ entry, onSave, onCancel }: EditRowProps) {
  const [date, setDate] = useState(entry.date);
  const [sets, setSets] = useState(String(entry.sets));
  const [reps, setReps] = useState(String(entry.reps));
  const [weight, setWeight] = useState(String(entry.weight));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = parseInt(sets), r = parseInt(reps), w = parseFloat(weight);
    if (!date || isNaN(s) || isNaN(r) || isNaN(w)) return;
    onSave({ date, sets: s, reps: r, weight: w });
  }

  const inputCls = "px-2 py-1 rounded-lg text-xs outline-none w-full";
  const inputStyle = {
    background: "rgba(246,242,234,0.1)",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "var(--cloud)",
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="px-3 py-2 rounded-xl space-y-2"
      style={{ background: "rgba(246,242,234,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="grid grid-cols-4 gap-1.5">
        <div>
          <label className="block text-xs mb-0.5" style={{ color: "var(--cloud-muted)" }}>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs mb-0.5" style={{ color: "var(--cloud-muted)" }}>Sets</label>
          <input type="number" min="1" value={sets} onChange={e => setSets(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs mb-0.5" style={{ color: "var(--cloud-muted)" }}>Reps</label>
          <input type="number" min="1" value={reps} onChange={e => setReps(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
        <div>
          <label className="block text-xs mb-0.5" style={{ color: "var(--cloud-muted)" }}>kg</label>
          <input type="number" step="0.5" min="0" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} style={inputStyle} />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-1 rounded-full text-xs font-medium"
          style={{ background: "var(--terracotta)", color: "var(--cloud)" }}
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1 rounded-full text-xs font-medium"
          style={{ background: "rgba(246,242,234,0.1)", color: "var(--cloud-muted)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
