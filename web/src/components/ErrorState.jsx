export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
      <p>{message || "Something went wrong"}</p>
      {onRetry && (
        <button className="mt-2 text-sm underline" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
