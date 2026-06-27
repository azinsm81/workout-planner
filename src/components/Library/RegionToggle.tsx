import type { Region } from "../../types";

interface Props {
  value: Region;
  onChange: (r: Region) => void;
}

export function RegionToggle({ value, onChange }: Props) {
  return (
    <div
      className="flex relative rounded-full p-1 shrink-0"
      style={{ background: "rgba(0,0,0,0.25)", gap: 0 }}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full transition-all duration-200"
        style={{
          width: "calc(50% - 4px)",
          left: value === "upper" ? 4 : "calc(50%)",
          background: value === "upper" ? "var(--terracotta)" : "var(--plum)",
        }}
      />
      {(["upper", "lower"] as Region[]).map(r => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className="relative z-10 flex-1 text-xs font-semibold py-1.5 px-4 rounded-full transition-colors duration-200"
          style={{ color: value === r ? "var(--cloud)" : "var(--cloud-muted)" }}
        >
          {r === "upper" ? "Upper" : "Lower"}
        </button>
      ))}
    </div>
  );
}
