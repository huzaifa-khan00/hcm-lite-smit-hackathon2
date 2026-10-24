export default function EmptyState({ message = "Nothing here yet" }) {
  return <p className="py-8 text-center text-gray-500">{message}</p>;
}
