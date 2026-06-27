import type { Session, Exercise } from "../../types";
import { SessionColumn } from "./SessionColumn";

interface Props {
  sessions: Session[];
  allExercises: Map<string, Exercise>;
  onRemove: (sessionId: string, instanceId: string) => void;
  onOpenProgress: (exerciseId: string) => void;
  overSessionId: string | null;
}

export function PlanTable({ sessions, allExercises, onRemove, onOpenProgress, overSessionId }: Props) {
  return (
    <div
      className="grid h-full gap-3"
      style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
    >
      {sessions.map(session => (
        <SessionColumn
          key={session.id}
          session={session}
          allExercises={allExercises}
          onRemove={(instanceId) => onRemove(session.id, instanceId)}
          onOpenProgress={onOpenProgress}
          isOver={overSessionId === session.id}
        />
      ))}
    </div>
  );
}
