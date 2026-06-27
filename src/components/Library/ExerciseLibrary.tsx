import { useState, useRef } from "react";
import type { Exercise, Region } from "../../types";
import { MuscleGroupSection } from "./MuscleGroupSection";
import { RegionToggle } from "./RegionToggle";
import { UPPER_BODY_ORDER, LOWER_BODY_ORDER } from "../../data/exerciseLibrary.seed";

interface Props {
  exercises: Exercise[];
  onAddCustom: (name: string, region: Region, muscleGroup: string) => void;
}

export function ExerciseLibrary({ exercises, onAddCustom }: Props) {
  const [region, setRegion] = useState<Region>("upper");
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();

  const order = region === "upper" ? UPPER_BODY_ORDER : LOWER_BODY_ORDER;
  const groups = order.map(mg => ({
    muscleGroup: mg,
    exs: exercises.filter(e =>
      e.region === region &&
      e.muscleGroup === mg &&
      (q === "" || e.name.toLowerCase().includes(q))
    ),
  })).filter(g => g.exs.length > 0);

  function openSearch() {
    setSearching(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function closeSearch() {
    setSearching(false);
    setQuery("");
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="px-4 pt-4 pb-3 shrink-0 space-y-3"
        style={{ background: "rgba(134,119,143,0.25)", borderBottom: "1px solid var(--border-hairline)" }}
      >
        <div className="flex items-center justify-between gap-2">
          {searching ? (
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Escape" && closeSearch()}
              placeholder="Search exercises…"
              className="flex-1 px-0 py-0.5 text-base font-display font-semibold bg-transparent outline-none border-b"
              style={{
                color: "var(--cloud)",
                borderColor: "rgba(246,242,234,0.3)",
              }}
            />
          ) : (
            <h2 className="text-base font-display font-semibold" style={{ color: "var(--cloud)" }}>
              Exercise Library
            </h2>
          )}

          <button
            onClick={searching ? closeSearch : openSearch}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            style={{ color: "var(--cloud-muted)" }}
            aria-label={searching ? "Close search" : "Search exercises"}
          >
            {searching ? (
              <span className="text-sm">×</span>
            ) : (
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M10.5 10.5 14 14" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>

        {!searching && (
          <p className="text-xs" style={{ color: "var(--cloud-muted)" }}>
            Drag into any session
          </p>
        )}

        <RegionToggle value={region} onChange={setRegion} />
      </div>

      {/* Scrollable muscle group list */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.15) transparent" }}
      >
        {groups.length === 0 && q ? (
          <p className="text-sm text-center pt-8" style={{ color: "var(--cloud-muted)" }}>
            No exercises match "{query}"
          </p>
        ) : (
          groups.map(({ muscleGroup, exs }) => (
            <MuscleGroupSection
              key={muscleGroup}
              muscleGroup={muscleGroup}
              region={region}
              exercises={exs}
              onAddCustom={onAddCustom}
            />
          ))
        )}
      </div>
    </div>
  );
}
