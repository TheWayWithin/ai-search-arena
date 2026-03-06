"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Cycle = {
  id: string;
  cycleIdentifier: string;
  displayName: string;
};

type CycleSelectorProps = {
  cycles: Cycle[];
  currentCycleId: string;
};

export function CycleSelector({ cycles, currentCycleId }: CycleSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (cycles.length <= 1) return null;

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const identifier = e.target.value;
    const params = new URLSearchParams(searchParams.toString());

    // Latest cycle = remove param; otherwise set it
    if (identifier === cycles[0].cycleIdentifier) {
      params.delete("cycle");
    } else {
      params.set("cycle", identifier);
    }

    const qs = params.toString();
    const path = window.location.pathname + (qs ? `?${qs}` : "");
    router.push(path);
  }

  const currentCycle = cycles.find((c) => c.id === currentCycleId);

  return (
    <select
      value={currentCycle?.cycleIdentifier ?? cycles[0].cycleIdentifier}
      onChange={handleChange}
      className="border-border text-arena-slate hover:border-arena-slate-light focus:border-arena-slate rounded border bg-white px-2 py-1 text-sm transition-colors outline-none"
    >
      {cycles.map((c) => (
        <option key={c.id} value={c.cycleIdentifier}>
          {c.displayName}
        </option>
      ))}
    </select>
  );
}
