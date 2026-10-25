import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth.js";
import { useToast } from "../../components/Toast.jsx";
import { errorMessage } from "../../api/client.js";
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../../api/comms.js";
import Modal from "../../components/Modal.jsx";
import FormField, {
  inputClass,
  buttonClass,
} from "../../components/FormField.jsx";

export default function Announcements() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "" });

  const isAdminOrHr = ["admin", "hr"].includes(user?.role);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getAnnouncements().catch(() => []);
      setAnnouncements(Array.isArray(res) ? res : res.items || []);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createAnnouncement(form);
      toast.success("Announcement published");
      setModalOpen(false);
      setForm({ title: "", content: "" });
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      toast.success("Announcement deleted");
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements & Notices</h1>
        {isAdminOrHr && (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
          >
            New Announcement
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading notices…</p>
      ) : announcements.length === 0 ? (
        <div className="rounded border bg-white p-8 text-center text-gray-400 shadow-sm">
          No announcements published yet.
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className="rounded-lg border bg-white p-5 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  {item.title}
                </h2>
                {isAdminOrHr && (
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {item.content}
              </p>
              <div className="text-xs text-gray-400">
                Posted by {item.authorName || "HR / Admin"} on{" "}
                {new Date(item.createdAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title="Publish Announcement" onClose={() => setModalOpen(false)}>
          <form onSubmit={handleCreate}>
            <FormField label="Title">
              <input
                type="text"
                required
                className={inputClass}
                placeholder="e.g. Office Holiday Notice"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </FormField>
            <FormField label="Content">
              <textarea
                required
                rows={4}
                className={inputClass}
                placeholder="Write your announcement message here..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </FormField>
            <button className={buttonClass} disabled={submitting}>
              {submitting ? "Publishing..." : "Publish"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
