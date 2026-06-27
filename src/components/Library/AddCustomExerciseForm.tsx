import { useState } from "react";
import type { Region } from "../../types";

interface Props {
  muscleGroup: string;
  region: Region;
  onAdd: (name: string, region: Region, muscleGroup: string) => void;
  onClose: () => void;
}

export function AddCustomExerciseForm({ muscleGroup, region, onAdd, onClose }: Props) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, region, muscleGroup);
    onClose();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 mt-2"
      onPointerDown={e => e.stopPropagation()}
    >
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Exercise name"
        className="flex-1 text-xs px-3 py-1.5 rounded-lg outline-none"
        style={{
          background: "rgba(246,242,234,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "var(--cloud)",
        }}
      />
      <button
        type="submit"
        className="text-xs px-3 py-1.5 rounded-full font-medium"
        style={{ background: "var(--terracotta)", color: "var(--cloud)" }}
      >
        Add
      </button>
      <button
        type="button"
        onClick={onClose}
        className="text-xs px-2 py-1.5 rounded-full"
        style={{ color: "var(--cloud-muted)" }}
      >
        ✕
      </button>
    </form>
  );
}
