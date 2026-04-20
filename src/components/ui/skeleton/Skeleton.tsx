// Reusable skeleton loading components — pulse animation on gray blocks

/** Base skeleton block */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

/**
 * Table skeleton — renders tbody rows with pulsing cells.
 * Pass `colWidths` as Tailwind width classes per column,
 * or `cols` for a uniform count (all cells will be full-width).
 */
export function SkeletonTableRows({
  rows = 8,
  colWidths,
  cols,
}: {
  rows?: number;
  colWidths?: string[];
  cols?: number;
}) {
  const widths =
    colWidths ??
    Array(cols ?? 4).fill("w-full");

  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-gray-100 dark:border-gray-700">
          {widths.map((w, ci) => (
            <td key={ci} className="px-4 py-3">
              <div
                className={`h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${w}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Stat card skeleton — matches the StatCard layout in Dashboard/Home.tsx */
export function SkeletonStatCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-12 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

/** Chart card skeleton — rectangular placeholder the same size as a donut chart */
export function SkeletonChart({ height = 220 }: { height?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <Skeleton className="h-4 w-36 mb-4" />
      <div
        className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl"
        style={{ height }}
      />
    </div>
  );
}

/** Mini recent-invoices table skeleton (compact row height) */
export function SkeletonMiniTableRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, ri) => (
        <tr key={ri} className="border-b border-gray-50 dark:border-gray-700/50">
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} className="py-2.5 pr-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
