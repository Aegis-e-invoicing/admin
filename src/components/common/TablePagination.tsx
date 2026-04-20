interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function TablePagination({
  page,
  totalPages,
  onPrev,
  onNext,
}: TablePaginationProps) {
  if (totalPages <= 1) return null;

  const btnCls =
    "px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg " +
    "text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 " +
    "hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors " +
    "disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button onClick={onPrev} disabled={page === 1} className={btnCls}>
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={page === totalPages}
          className={btnCls}
        >
          Next
        </button>
      </div>
    </div>
  );
}
