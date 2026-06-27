import { useState, useCallback, useEffect, useRef } from "react";
import type { PlanState, PlannedExercise } from "../types";

const STORAGE_KEY = "session-planner:plan";

function defaultState(): PlanState {
  return {
    sessions: [1, 2, 3, 4, 5].map(n => ({
      id: `session-${n}`,
      label: `Session ${n}`,
      exercises: [],
    })),
    customExercises: [],
  };
}

function loadState(): PlanState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultState();
}

export function usePlanState() {
  const [state, setState] = useState<PlanState>(loadState);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((next: PlanState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }, 300);
  }, []);

  const update = useCallback((fn: (prev: PlanState) => PlanState) => {
    setState(prev => {
      const next = fn(prev);
      save(next);
      return next;
    });
  }, [save]);

  const addExerciseToSession = useCallback((sessionId: string, exerciseId: string, atIndex?: number) => {
    const instanceId = `${exerciseId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const planned: PlannedExercise = { instanceId, exerciseId };
    update(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => {
        if (s.id !== sessionId) return s;
        const exs = [...s.exercises];
        if (atIndex !== undefined) exs.splice(atIndex, 0, planned);
        else exs.push(planned);
        return { ...s, exercises: exs };
      }),
    }));
    return instanceId;
  }, [update]);

  const removeExerciseFromSession = useCallback((sessionId: string, instanceId: string) => {
    update(prev => ({
      ...prev,
      sessions: prev.sessions.map(s =>
        s.id !== sessionId ? s : { ...s, exercises: s.exercises.filter(e => e.instanceId !== instanceId) }
      ),
    }));
  }, [update]);

  const moveExercise = useCallback((
    fromSessionId: string,
    toSessionId: string,
    instanceId: string,
    toIndex: number,
  ) => {
    update(prev => {
      const fromSession = prev.sessions.find(s => s.id === fromSessionId)!;
      const item = fromSession.exercises.find(e => e.instanceId === instanceId)!;
      if (!item) return prev;

      return {
        ...prev,
        sessions: prev.sessions.map(s => {
          if (s.id === fromSessionId && s.id === toSessionId) {
            const exs = s.exercises.filter(e => e.instanceId !== instanceId);
            const insertAt = Math.min(toIndex, exs.length);
            exs.splice(insertAt, 0, item);
            return { ...s, exercises: exs };
          }
          if (s.id === fromSessionId) {
            return { ...s, exercises: s.exercises.filter(e => e.instanceId !== instanceId) };
          }
          if (s.id === toSessionId) {
            const exs = [...s.exercises];
            const insertAt = Math.min(toIndex, exs.length);
            exs.splice(insertAt, 0, item);
            return { ...s, exercises: exs };
          }
          return s;
        }),
      };
    });
  }, [update]);

  const addCustomExercise = useCallback((name: string, region: "upper" | "lower", muscleGroup: string) => {
    const id = `custom-${muscleGroup}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    update(prev => ({
      ...prev,
      customExercises: [...prev.customExercises, { id, name, region, muscleGroup, isCustom: true }],
    }));
  }, [update]);

  const resetWeek = useCallback(() => {
    const next = defaultState();
    setState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  return {
    state,
    addExerciseToSession,
    removeExerciseFromSession,
    moveExercise,
    addCustomExercise,
    resetWeek,
  };
}
