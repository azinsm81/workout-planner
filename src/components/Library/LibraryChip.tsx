import { useDraggable } from "@dnd-kit/core";
import type { Exercise } from "../../types";
import { MUSCLE_GROUP_LABELS } from "../../data/exerciseLibrary.seed";

interface Props {
  exercise: Exercise;
}

export function LibraryChip({ exercise }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${exercise.id}`,
    data: { type: "library", exercise },
  });

  const regionColor = exercise.region === "upper" ? "var(--terracotta)" : "var(--plum)";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-grab active:cursor-grabbing select-none transition-all duration-100"
      style={{
        background: "rgba(134,119,143,0.18)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "var(--cloud)",
        opacity: isDragging ? 0.4 : 1,
        transform: isDragging ? "scale(1.05)" : "scale(1)",
      }}
      title={`${exercise.name} · ${MUSCLE_GROUP_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: regionColor }}
      />
      {exercise.name}
    </div>
  );
}
