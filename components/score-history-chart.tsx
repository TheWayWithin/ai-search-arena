"use client";

type DataPoint = {
  cycleIdentifier: string;
  displayName: string;
  score: number;
  rank: number;
};

type ScoreHistoryChartProps = {
  data: DataPoint[];
};

function shortLabel(displayName: string): string {
  // "March 2026 Benchmark" → "Mar 2026", "April 2026 Benchmark (Full)" → "Apr 2026"
  const match = displayName.match(/^(\w+)\s+(\d{4})/);
  if (!match) return displayName;
  const month = match[1].slice(0, 3);
  return `${month} ${match[2]}`;
}

export function ScoreHistoryChart({ data }: ScoreHistoryChartProps) {
  if (data.length < 2) return null;

  const scores = data.map((d) => d.score);
  const minScore = Math.floor(Math.min(...scores) - 0.5);
  const maxScore = Math.ceil(Math.max(...scores) + 0.5);
  const range = maxScore - minScore || 1;

  // Chart dimensions — viewBox units (not pixels)
  const width = 100;
  const height = 60;
  const padLeft = 10;
  const padRight = 10;
  const padTop = 8;
  const padBottom = 16;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Map data to coordinates
  const points = data.map((d, i) => ({
    x: padLeft + (i / (data.length - 1)) * chartW,
    y: padTop + chartH - ((d.score - minScore) / range) * chartH,
    ...d,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Area path (fill under line)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  // Y-axis gridlines
  const gridCount = 3;
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const val = minScore + (range / gridCount) * i;
    const y = padTop + chartH - ((val - minScore) / range) * chartH;
    return { y, label: val.toFixed(1) };
  });

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {gridLines.map((g) => (
          <g key={g.label}>
            <line
              x1={padLeft}
              y1={g.y}
              x2={width - padRight}
              y2={g.y}
              stroke="currentColor"
              strokeWidth="0.15"
              className="text-border"
            />
            <text
              x={padLeft - 1.5}
              y={g.y + 0.8}
              textAnchor="end"
              className="text-arena-slate-light fill-current"
              fontSize="2.5"
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} className="fill-mastery-blue/10" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          className="stroke-mastery-blue"
          strokeWidth="0.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points and labels */}
        {points.map((p) => (
          <g key={p.cycleIdentifier}>
            <circle cx={p.x} cy={p.y} r="1.2" className="fill-mastery-blue" />
            <text
              x={p.x}
              y={p.y - 2.5}
              textAnchor="middle"
              className="text-arena-slate fill-current font-semibold"
              fontSize="2.8"
            >
              {p.score.toFixed(1)}
            </text>
            <text
              x={p.x}
              y={padTop + chartH + 5}
              textAnchor="middle"
              className="text-arena-slate-light fill-current"
              fontSize="2.4"
            >
              {shortLabel(p.displayName)}
            </text>
            <text
              x={p.x}
              y={padTop + chartH + 8.5}
              textAnchor="middle"
              className="text-arena-slate-light fill-current"
              fontSize="2"
            >
              #{p.rank}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
