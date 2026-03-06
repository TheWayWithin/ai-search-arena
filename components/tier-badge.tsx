import { Badge } from "@/components/ui/badge";

type TierBadgeProps = {
  tier: "Gold" | "Silver" | "Bronze";
  label: string;
};

const tierStyles: Record<string, string> = {
  Gold: "bg-badge-gold/10 text-badge-gold border-badge-gold/30",
  Silver: "bg-badge-silver/10 text-badge-silver border-badge-silver/30",
  Bronze: "bg-badge-bronze/10 text-badge-bronze border-badge-bronze/30",
};

export function TierBadge({ tier, label }: TierBadgeProps) {
  return (
    <Badge variant="outline" className={tierStyles[tier]}>
      {label}
    </Badge>
  );
}
