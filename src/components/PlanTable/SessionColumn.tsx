import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Session, Exercise } from "../../types";
import { ExerciseCard } from "./ExerciseCard";

interface Props {
  session: Session;
  allExercises: Map<string, Exercise>;
  onRemove: (instanceId: string) => void;
  onOpenProgress: (exerciseId: string) => void;
  isOver: boolean;
}

export function SessionColumn({ session, allExercises, onRemove, onOpenProgress, isOver }: Props) {
  const { setNodeRef } = useDroppable({ id: session.id, data: { type: "session", sessionId: session.id } });

  const muscleGroupsInSession = session.exercises.map(e => allExercises.get(e.exerciseId)?.muscleGroup);

  return (
    <div className="flex flex-col min-w-0 h-full">
      {/* Column header */}
      <div
        className="px-2 py-3 text-center font-display text-lg font-semibold shrink-0"
        style={{ color: "var(--cloud)", letterSpacing: "-0.02em" }}
      >
        {session.label}
      </div>

      {/* Drop zone — dashed border is always present; drag-over adds a tint only */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-2 p-2 overflow-y-auto"
        style={{
          border: "1.5px dashed rgba(246,242,234,0.18)",
          borderRadius: 16,
          background: isOver ? "rgba(107,92,130,0.12)" : "transparent",
          transition: "background 120ms ease",
          minHeight: 0,
        }}
      >
        <SortableContext items={session.exercises.map(e => e.instanceId)} strategy={verticalListSortingStrategy}>
          {session.exercises.length === 0 ? (
            <div
              className="flex-1 flex items-center justify-center text-sm text-center px-4"
              style={{ color: "var(--cloud-muted)", minHeight: 80 }}
            >
              Drag exercises here
            </div>
          ) : (
            session.exercises.map(pe => {
              const exercise = allExercises.get(pe.exerciseId);
              if (!exercise) return null;
              const muscleCount = muscleGroupsInSession.filter(m => m === exercise.muscleGroup).length;
              return (
                <ExerciseCard
                  key={pe.instanceId}
                  instanceId={pe.instanceId}
                  exercise={exercise}
                  isDuplicate={muscleCount > 1}
                  onRemove={() => onRemove(pe.instanceId)}
                  onOpenProgress={() => onOpenProgress(pe.exerciseId)}
                />
              );
            })
          )}
        </SortableContext>
      </div>
    </div>
  );
}
