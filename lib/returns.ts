export type ReturnResolution = "returnable" | "quality_resolution";

interface ReturnableItem {
  name: string;
  return_policy?: string;
}

const PERISHABLE =
  /\b(fresh|milk|curd|dahi|yogurt|paneer|cheese|butter|cream|egg|bread|batter|vegetable|fruit|chicken|meat|fish|frozen)\b/i;

export function getReturnResolution(item: ReturnableItem): ReturnResolution {
  if (item.return_policy === "no_return") return "quality_resolution";
  if (item.return_policy === "7_day_return") return "returnable";
  return PERISHABLE.test(item.name) ? "quality_resolution" : "returnable";
}

export function getReturnLabel(item: ReturnableItem): string {
  return getReturnResolution(item) === "returnable"
    ? "7-day return or replacement"
    : "Quality refund or replacement";
}
