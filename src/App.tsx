import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from "@dnd-kit/core";

// Hybrid strategy: pointer position wins for cross-column accuracy;
// closestCenter handles the gaps between cards in same-column reordering.
const hybridCollision: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return closestCenter(args);
};
import type { Exercise } from "./types";
import { usePlanState } from "./hooks/usePlanState";
import { useExerciseLogs } from "./hooks/useExerciseLogs";
import { exerciseLibrary } from "./data/exerciseLibrary.seed";
import { PlanTable } from "./components/PlanTable/PlanTable";
import { ExerciseCard } from "./components/PlanTable/ExerciseCard";
import { ExerciseLibrary } from "./components/Library/ExerciseLibrary";
import { ProgressModal } from "./components/Progress/ProgressModal";

interface ActiveDrag {
  type: "card" | "library";
  exercise: Exercise;
  instanceId?: string;
  fromSessionId?: string;
}

export default function App() {
  const { state, addExerciseToSession, removeExerciseFromSession, moveExercise, addCustomExercise, resetWeek } = usePlanState();
  const { logs, addEntry, updateEntry, deleteEntry, restoreEntry } = useExerciseLogs();

  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [overSessionId, setOverSessionId] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [progressExerciseId, setProgressExerciseId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const allExercises = useMemo<Map<string, Exercise>>(() => {
    const map = new Map<string, Exercise>();
    for (const ex of exerciseLibrary) map.set(ex.id, ex);
    for (const ex of state.customExercises) map.set(ex.id, ex);
    return map;
  }, [state.customExercises]);

  const libraryExercises = useMemo(() => [...exerciseLibrary, ...state.customExercises], [state.customExercises]);

  const progressExercise = progressExerciseId ? allExercises.get(progressExerciseId) : null;

  function onDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    if (data?.type === "library") {
      setActiveDrag({ type: "library", exercise: data.exercise });
    } else if (data?.type === "card") {
      const fromSession = state.sessions.find(s => s.exercises.some(e => e.instanceId === data.instanceId));
      setActiveDrag({ type: "card", exercise: data.exercise, instanceId: data.instanceId, fromSessionId: fromSession?.id });
    }
  }

  function onDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) { setOverSessionId(null); return; }
    const overData = over.data.current;
    if (overData?.type === "session") {
      setOverSessionId(overData.sessionId);
    } else if (overData?.type === "card") {
      const session = state.sessions.find(s => s.exercises.some(e => e.instanceId === over.id));
      setOverSessionId(session?.id ?? null);
    } else {
      setOverSessionId(null);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    // Always clear drag state first — this is the v1.0 bug guard
    const { active, over } = event;
    setActiveDrag(null);
    setOverSessionId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "library") {
      let targetSessionId: string | null = null;
      let targetIndex: number | undefined;

      if (overData?.type === "session") {
        targetSessionId = overData.sessionId;
      } else if (overData?.type === "card") {
        const session = state.sessions.find(s => s.exercises.some(e => e.instanceId === over.id));
        if (session) {
          targetSessionId = session.id;
          targetIndex = session.exercises.findIndex(e => e.instanceId === over.id);
        }
      }

      if (targetSessionId) addExerciseToSession(targetSessionId, activeData.exercise.id, targetIndex);
      return;
    }

    if (activeData?.type === "card") {
      const instanceId = activeData.instanceId as string;

      // Derive fromSession from live state — card data never carries fromSessionId
      const fromSession = state.sessions.find(s => s.exercises.some(e => e.instanceId === instanceId));
      if (!fromSession) return;
      const fromSessionId = fromSession.id;

      let targetSessionId: string | null = null;
      let targetIndex = 0;

      if (overData?.type === "session") {
        targetSessionId = overData.sessionId;
        const targetSession = state.sessions.find(s => s.id === targetSessionId)!;
        targetIndex = targetSession.exercises.length;
      } else if (overData?.type === "card") {
        const targetSession = state.sessions.find(s => s.exercises.some(e => e.instanceId === over.id));
        if (targetSession) {
          targetSessionId = targetSession.id;
          targetIndex = targetSession.exercises.findIndex(e => e.instanceId === over.id);
        }
      }

      if (!targetSessionId) return;

      if (targetSessionId === fromSessionId) {
        // Same-session reorder — only move if landing on a different card
        const oldIndex = fromSession.exercises.findIndex(e => e.instanceId === instanceId);
        if (oldIndex !== targetIndex) {
          moveExercise(fromSessionId, fromSessionId, instanceId, targetIndex);
        }
      } else {
        moveExercise(fromSessionId, targetSessionId, instanceId, targetIndex);
      }
    }
  }

  return (
    <div
      className="flex flex-col"
      style={{ height: "100dvh", overflow: "hidden", background: "linear-gradient(180deg, var(--bg-gradient-start) 0%, var(--bg-gradient-warm) 25%, var(--bg-gradient-cool) 65%, var(--bg-gradient-end) 100%)" }}
    >
      {/* Top bar */}
      <header
        className="shrink-0 flex items-center justify-between px-6"
        style={{ height: 56, borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <h1 className="font-display text-2xl font-semibold tracking-tight" style={{ color: "var(--cloud)" }}>
          Session Planner
        </h1>
        <div className="flex items-center gap-3">
          {/* Mobile: opens drawer */}
          <button
            className="lg:hidden text-sm px-4 py-1.5 rounded-full font-medium"
            style={{ background: "var(--terracotta)", color: "var(--cloud)" }}
            onClick={() => setDrawerOpen(true)}
          >
            Exercise list
          </button>
          {/* Desktop: toggles sidebar */}
          <button
            className="hidden lg:block text-sm px-4 py-1.5 rounded-full font-medium transition-opacity hover:opacity-80"
            style={{
              background: libraryOpen ? "var(--terracotta)" : "rgba(246,242,234,0.12)",
              color: "var(--cloud)",
              border: libraryOpen ? "none" : "1px solid rgba(255,255,255,0.15)",
            }}
            onClick={() => setLibraryOpen(o => !o)}
          >
            Exercise list
          </button>
          <button
            className="text-sm px-4 py-1.5 rounded-full border font-medium transition-opacity hover:opacity-70"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "var(--cloud-muted)" }}
            onClick={() => { if (confirm("Reset all sessions? Your exercise history will be preserved.")) resetWeek(); }}
          >
            Reset week
          </button>
        </div>
      </header>

      {/* Main */}
      <DndContext
        sensors={sensors}
        collisionDetection={hybridCollision}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Plan Table */}
          <main className="flex-1 overflow-hidden p-4 lg:p-6 min-w-0">
            <PlanTable
              sessions={state.sessions}
              allExercises={allExercises}
              onRemove={removeExerciseFromSession}
              onOpenProgress={setProgressExerciseId}
              overSessionId={overSessionId}
            />
          </main>

          {/* Library sidebar — collapses to width 0 */}
          <aside
            className="hidden lg:flex flex-col shrink-0 overflow-hidden transition-all duration-300"
            style={{
              width: libraryOpen ? 340 : 0,
              opacity: libraryOpen ? 1 : 0,
              pointerEvents: libraryOpen ? "auto" : "none",
              background: "linear-gradient(160deg, var(--glass-top), var(--glass-bottom))",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderLeft: libraryOpen ? "1px solid var(--border-hairline)" : "none",
            }}
          >
            {libraryOpen && (
              <ExerciseLibrary exercises={libraryExercises} onAddCustom={addCustomExercise} />
            )}
          </aside>
        </div>

        {/* Mobile Library drawer */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div
              className="w-80 flex flex-col overflow-hidden"
              style={{
                background: "linear-gradient(160deg, var(--glass-top), var(--glass-bottom))",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderLeft: "1px solid var(--border-hairline)",
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: "1px solid var(--border-hairline)" }}>
                <span className="font-display font-semibold" style={{ color: "var(--cloud)" }}>Library</span>
                <button onClick={() => setDrawerOpen(false)} style={{ color: "var(--cloud-muted)" }}>✕</button>
              </div>
              <ExerciseLibrary exercises={libraryExercises} onAddCustom={addCustomExercise} />
            </div>
          </div>
        )}

        <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
          {activeDrag && (
            <ExerciseCard
              instanceId={activeDrag.instanceId ?? "overlay"}
              exercise={activeDrag.exercise}
              isDuplicate={false}
              onRemove={() => {}}
              onOpenProgress={() => {}}
              isOverlay
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Progress modal */}
      {progressExercise && (
        <ProgressModal
          exercise={progressExercise}
          entries={logs[progressExerciseId!] ?? []}
          onAdd={entry => addEntry(progressExerciseId!, entry)}
          onUpdate={(idx, entry) => updateEntry(progressExerciseId!, idx, entry)}
          onDelete={idx => deleteEntry(progressExerciseId!, idx)}
          onRestore={(idx, entry) => restoreEntry(progressExerciseId!, idx, entry)}
          onClose={() => setProgressExerciseId(null)}
        />
      )}
    </div>
  );
}
