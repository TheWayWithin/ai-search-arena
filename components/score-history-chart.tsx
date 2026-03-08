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

export function ScoreHistoryChart({ data }: ScoreHistoryChartProps) {
  if (data.length < 2) return null;

  const scores = data.map((d) => d.score);
  const minScore = Math.floor(Math.min(...scores) - 0.5);
  const maxScore = Math.ceil(Math.max(...scores) + 0.5);
  const range = maxScore - minScore || 1;

  // Chart dimensions
  const width = 100; // percentage-based viewBox
  const height = 50;
  const padX = 8;
  const padTop = 6;
  const padBottom = 14;
  const chartW = width - padX * 2;
  const chartH = height - padTop - padBottom;

  // Map data to coordinates
  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * chartW,
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
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {gridLines.map((g) => (
          <g key={g.label}>
            <line
              x1={padX}
              y1={g.y}
              x2={width - padX}
              y2={g.y}
              stroke="currentColor"
              strokeWidth="0.15"
              className="text-border"
            />
            <text
              x={padX - 1}
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
              y={p.y - 2}
              textAnchor="middle"
              className="text-arena-slate fill-current font-semibold"
              fontSize="2.8"
            >
              {p.score.toFixed(1)}
            </text>
            <text
              x={p.x}
              y={padTop + chartH + 4}
              textAnchor="middle"
              className="text-arena-slate-light fill-current"
              fontSize="2.2"
            >
              {p.displayName}
            </text>
            <text
              x={p.x}
              y={padTop + chartH + 7}
              textAnchor="middle"
              className="text-arena-slate-light fill-current"
              fontSize="1.8"
            >
              #{p.rank}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
