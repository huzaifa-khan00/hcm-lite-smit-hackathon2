import { useEffect, useState } from "react";
import {
  departments,
  designations,
  leaveTypes,
  holidays,
} from "../../api/org.js";
import CrudPanel from "../../components/CrudPanel.jsx";

const TABS = ["Departments", "Designations", "Leave Types", "Holidays"];

export default function OrgSetup() {
  const [tab, setTab] = useState(TABS[0]);
  const [deptOptions, setDeptOptions] = useState([]);

  useEffect(() => {
    if (tab !== "Designations") return;
    departments
      .list()
      .then((list) =>
        setDeptOptions(list.map((d) => ({ value: d._id, label: d.name }))),
      )
      .catch(() => setDeptOptions([]));
  }, [tab]);

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Org Setup</h1>

      <div className="mt-4 flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm ${
              tab === t
                ? "border-b-2 border-blue-600 font-medium text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "Departments" && (
          <CrudPanel
            key="departments"
            noun="Department"
            api={departments}
            fields={[{ key: "name", label: "Name" }]}
            columns={[{ label: "Name", render: (r) => r.name }]}
          />
        )}

        {tab === "Designations" && (
          <CrudPanel
            key="designations"
            noun="Designation"
            api={designations}
            fields={[
              { key: "title", label: "Title" },
              {
                key: "department",
                label: "Department",
                type: "select",
                options: deptOptions,
              },
            ]}
            columns={[
              { label: "Title", render: (r) => r.title },
              { label: "Department", render: (r) => r.department?.name || "—" },
            ]}
          />
        )}

        {tab === "Leave Types" && (
          <CrudPanel
            key="leave-types"
            noun="Leave type"
            api={leaveTypes}
            fields={[
              { key: "name", label: "Name" },
              {
                key: "daysPerYear",
                label: "Days per year",
                type: "number",
                default: "14",
              },
              {
                key: "isPaid",
                label: "Paid leave",
                type: "checkbox",
                default: true,
              },
            ]}
            columns={[
              { label: "Name", render: (r) => r.name },
              { label: "Days / year", render: (r) => r.daysPerYear },
              { label: "Paid", render: (r) => (r.isPaid ? "Yes" : "No") },
            ]}
          />
        )}

        {tab === "Holidays" && (
          <CrudPanel
            key="holidays"
            noun="Holiday"
            api={holidays}
            fields={[
              { key: "name", label: "Name" },
              { key: "date", label: "Date", type: "date" },
            ]}
            columns={[
              { label: "Date", render: (r) => r.date },
              { label: "Name", render: (r) => r.name },
            ]}
          />
        )}
      </div>
    </div>
  );
}
