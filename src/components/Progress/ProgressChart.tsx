import type { ExerciseLogEntry } from "../../types";

interface Props {
  entries: ExerciseLogEntry[];
}

export function ProgressChart({ entries }: Props) {
  if (entries.length < 2) {
    return (
      <p className="text-center text-sm py-6" style={{ color: "var(--cloud-muted)" }}>
        Log a couple of sessions to see your progression here.
      </p>
    );
  }

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map(e => e.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const W = 400, H = 120, PAD = 16;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const points = sorted.map((e, i) => ({
    x: PAD + (i / (sorted.length - 1)) * innerW,
    y: PAD + (1 - (e.weight - minW) / range) * innerH,
    entry: e,
  }));

  const polyline = points.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "rgba(0,0,0,0.2)" }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
        {/* Grid lines */}
        {[0, 0.5, 1].map(t => (
          <line
            key={t}
            x1={PAD} y1={PAD + t * innerH}
            x2={W - PAD} y2={PAD + t * innerH}
            stroke="rgba(246,242,234,0.08)" strokeWidth="1"
          />
        ))}

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="var(--plum)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="var(--cloud)" />
        ))}

        {/* Y axis labels */}
        <text x={PAD} y={PAD - 4} fontSize="9" fill="rgba(246,242,234,0.4)" textAnchor="start">
          {maxW}kg
        </text>
        <text x={PAD} y={H - 3} fontSize="9" fill="rgba(246,242,234,0.4)" textAnchor="start">
          {minW}kg
        </text>
      </svg>
    </div>
  );
}
