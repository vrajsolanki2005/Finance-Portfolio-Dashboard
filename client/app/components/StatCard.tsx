interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  positive?: boolean;
  negative?: boolean;
}

export default function StatCard({
  title,
  value,
  subtitle,
  positive,
  negative,
}: StatCardProps) {
  let valueClass = "text-gray-900";

  if (positive) {
    valueClass = "text-green-600";
  }

  if (negative) {
    valueClass = "text-red-600";
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>

      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
