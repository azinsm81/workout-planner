import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRef } from "react";
import type { Exercise } from "../../types";
import { MUSCLE_GROUP_LABELS } from "../../data/exerciseLibrary.seed";

interface Props {
  instanceId: string;
  exercise: Exercise;
  isDuplicate: boolean;
  onRemove: () => void;
  onOpenProgress: () => void;
  isOverlay?: boolean;
}

const DRAG_THRESHOLD = 6;

export function ExerciseCard({ instanceId, exercise, isDuplicate, onRemove, onOpenProgress, isOverlay }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: instanceId, data: { type: "card", instanceId, exercise } });

  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const regionColor = exercise.region === "upper" ? "var(--terracotta)" : "var(--plum)";

  function handlePointerDown(e: React.PointerEvent) {
    // Don't track drags or clicks that start on the remove button
    if ((e.target as Element).closest('[data-no-dnd]')) return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    didDrag.current = false;
    listeners?.onPointerDown?.(e);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!pointerStart.current) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) didDrag.current = true;
  }

  function handlePointerUp(e: React.PointerEvent) {
    // Defense in depth: never open modal if the pointer ended on the remove button
    if ((e.target as Element).closest('[data-no-dnd]')) {
      pointerStart.current = null;
      didDrag.current = false;
      return;
    }
    if (pointerStart.current && !didDrag.current) onOpenProgress();
    pointerStart.current = null;
    didDrag.current = false;
  }

  return (
    <div
      ref={setNodeRef}
      style={isOverlay
        ? { transform: "scale(1.03)", boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }
        : style
      }
      className="glass-card group relative flex items-center gap-3 px-4 py-3 cursor-grab active:cursor-grabbing select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      {...attributes}
    >
      <span
        className="shrink-0 w-2.5 h-2.5 rounded-full"
        style={{
          backgroundColor: regionColor,
          boxShadow: isDuplicate
            ? `0 0 0 2px rgba(45,41,64,0.9), 0 0 0 3.5px ${regionColor}`
            : "none",
        }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--cloud)" }}>
          {exercise.name}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--cloud-muted)" }}>
          {MUSCLE_GROUP_LABELS[exercise.muscleGroup] ?? exercise.muscleGroup}
        </p>
      </div>

      {/* data-no-dnd excludes this from drag activation and modal-open logic */}
      <button
        data-no-dnd="true"
        className="remove-btn shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 text-xs"
        style={{ color: "var(--cloud-muted)" }}
        onClick={e => { e.stopPropagation(); onRemove(); }}
        aria-label="Remove exercise"
      >
        ×
      </button>
    </div>
  );
}
