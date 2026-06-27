import { useState } from "react";
import type { Exercise, Region } from "../../types";
import { LibraryChip } from "./LibraryChip";
import { AddCustomExerciseForm } from "./AddCustomExerciseForm";
import { MUSCLE_GROUP_LABELS } from "../../data/exerciseLibrary.seed";

interface Props {
  muscleGroup: string;
  region: Region;
  exercises: Exercise[];
  onAddCustom: (name: string, region: Region, muscleGroup: string) => void;
}

export function MuscleGroupSection({ muscleGroup, region, exercises, onAddCustom }: Props) {
  const [showForm, setShowForm] = useState(false);
  const label = MUSCLE_GROUP_LABELS[muscleGroup] ?? muscleGroup;

  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "var(--cloud-muted)" }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {exercises.map(ex => (
          <LibraryChip key={ex.id} exercise={ex} />
        ))}
      </div>
      {showForm ? (
        <AddCustomExerciseForm
          muscleGroup={muscleGroup}
          region={region}
          onAdd={onAddCustom}
          onClose={() => setShowForm(false)}
        />
      ) : (
        <button
          className="mt-2 text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
          style={{ color: "var(--cloud-muted)" }}
          onClick={() => setShowForm(true)}
        >
          <span>＋</span> Add exercise
        </button>
      )}
    </div>
  );
}
