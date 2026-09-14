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
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg transition-all duration-200 hover:border-slate-700 hover:shadow-cyan-500/5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        {positive && (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
            ▲ Positive
          </span>
        )}
        {negative && (
          <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-400">
            ▼ Negative
          </span>
        )}
      </div>

      <p
        className={`mt-3 text-2xl font-bold tracking-tight ${
          positive
            ? "text-emerald-400"
            : negative
            ? "text-rose-400"
            : "text-slate-100"
        }`}
      >
        {value}
      </p>

      {subtitle && (
        <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}