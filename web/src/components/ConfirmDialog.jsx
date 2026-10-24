import Modal from "./Modal.jsx";

export default function ConfirmDialog({
  title = "Are you sure?",
  message,
  confirmText = "Delete",
  busy,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-gray-600">{message}</p>
      <div className="mt-5 flex justify-end gap-3">
        <button className="rounded border px-4 py-2 text-sm" onClick={onCancel}>
          Cancel
        </button>
        <button
          disabled={busy}
          className="rounded bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
