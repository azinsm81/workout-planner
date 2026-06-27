import { useState, useCallback, useRef } from "react";
import type { ExerciseLogs, ExerciseLogEntry } from "../types";

const STORAGE_KEY = "session-planner:logs";

function loadLogs(): ExerciseLogs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function useExerciseLogs() {
  const [logs, setLogs] = useState<ExerciseLogs>(loadLogs);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((next: ExerciseLogs) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }, 300);
  }, []);

  const addEntry = useCallback((exerciseId: string, entry: ExerciseLogEntry) => {
    setLogs(prev => {
      const next = { ...prev, [exerciseId]: [...(prev[exerciseId] ?? []), entry] };
      save(next);
      return next;
    });
  }, [save]);

  const updateEntry = useCallback((exerciseId: string, entryIndex: number, entry: ExerciseLogEntry) => {
    setLogs(prev => {
      const entries = [...(prev[exerciseId] ?? [])];
      entries[entryIndex] = entry;
      const next = { ...prev, [exerciseId]: entries };
      save(next);
      return next;
    });
  }, [save]);

  const deleteEntry = useCallback((exerciseId: string, entryIndex: number) => {
    setLogs(prev => {
      const entries = [...(prev[exerciseId] ?? [])];
      entries.splice(entryIndex, 1);
      const next = { ...prev, [exerciseId]: entries };
      save(next);
      return next;
    });
  }, [save]);

  const restoreEntry = useCallback((exerciseId: string, entryIndex: number, entry: ExerciseLogEntry) => {
    setLogs(prev => {
      const entries = [...(prev[exerciseId] ?? [])];
      entries.splice(entryIndex, 0, entry);
      const next = { ...prev, [exerciseId]: entries };
      save(next);
      return next;
    });
  }, [save]);

  return { logs, addEntry, updateEntry, deleteEntry, restoreEntry };
}
