import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const stateConfig: Record<string, { label: string; className: string }> = {
  Draft: {
    label: "Draft",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  Planning: {
    label: "Planning",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  Evaluation: {
    label: "Evaluation",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  Synthesis: {
    label: "Synthesis",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  Review: {
    label: "Review",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  VendorReview: {
    label: "Vendor Review",
    className: "bg-teal-100 text-teal-700 border-teal-200",
  },
  Publication: {
    label: "Publication",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  Completed: {
    label: "Completed",
    className: "bg-green-100 text-green-800 border-green-300",
  },
  Suspended: {
    label: "Suspended",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  Cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-300",
  },
};

export function StateBadge({
  state,
  size = "default",
  className,
}: {
  state: string;
  size?: "default" | "lg";
  className?: string;
}) {
  const config = stateConfig[state] ?? {
    label: state,
    className: "bg-gray-100 text-gray-700",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        config.className,
        size === "lg" && "px-3 py-1 text-sm",
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
