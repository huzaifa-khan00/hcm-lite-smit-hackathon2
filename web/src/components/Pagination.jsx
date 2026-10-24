export default function Pagination({ page, limit, total, onChange }) {
  const pages = Math.max(Math.ceil(total / limit), 1);
  if (total <= limit) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
      <span>
        Page {page} of {pages} ({total} total)
      </span>
      <div className="space-x-2">
        <button
          className="rounded border px-3 py-1 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="rounded border px-3 py-1 disabled:opacity-40"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
