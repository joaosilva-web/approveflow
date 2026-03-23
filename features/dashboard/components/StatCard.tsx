export default function StatCard({
  label,
  value,
  color,
  bgColor,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  bgColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
      {icon && (
        <span
          className={`text-2xl p-2 rounded-xl ${bgColor ?? "bg-white/[0.03]"} border border-white/[0.06]`}
        >
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs text-white/40">{label}</span>
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
      </div>
    </div>
  );
}
