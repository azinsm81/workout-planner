export type Region = "upper" | "lower";

export interface Exercise {
  id: string;
  name: string;
  region: Region;
  muscleGroup: string;
  isCustom: boolean;
}

export interface PlannedExercise {
  instanceId: string;
  exerciseId: string;
}

export interface Session {
  id: string;
  label: string;
  exercises: PlannedExercise[];
}

export interface PlanState {
  sessions: Session[];
  customExercises: Exercise[];
}

export interface ExerciseLogEntry {
  date: string;   // "2026-06-27"
  sets: number;
  reps: number;
  weight: number; // kg
}

export type ExerciseLogs = Record<string, ExerciseLogEntry[]>;
