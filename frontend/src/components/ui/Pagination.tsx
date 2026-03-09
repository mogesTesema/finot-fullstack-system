import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + maxVisible - 1);

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
      <button
        aria-label="Previous page"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 bg-[#142850] text-yellow-400 rounded-lg disabled:opacity-40 hover:bg-[#1B3067]"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-lg font-medium transition
          ${
            page === currentPage
              ? "bg-yellow-400 text-[#1B3067]"
              : "bg-[#142850] text-white hover:bg-[#1B3067]"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        aria-label="Next page"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 bg-[#142850] text-yellow-400 rounded-lg disabled:opacity-40 hover:bg-[#1B3067]"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}