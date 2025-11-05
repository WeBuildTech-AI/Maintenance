"use client";

import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../../store/hooks";
import {
  addTimeEntry,
  deleteTimeEntry,
} from "../../../store/workOrders/workOrders.thunks";
import AddTimeModal from "../../work-orders/ToDoView/AddTimeModal";

// helper: time ago formatter
const timeAgo = (timestamp: string | number) => {
  const time = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp;
  const diff = Date.now() - time;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "less than a minute ago";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// helper: total mins → formatted duration
const formatDuration = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

type Props = {
  onCancel: () => void;
  workOrderId?: string;
  selectedWorkOrder?: any;
};

export default function TimeOverviewPanel({
  onCancel,
  workOrderId,
  selectedWorkOrder,
}: Props) {
  const dispatch = useAppDispatch();
  const user = useSelector((state: any) => state.auth?.user);
  const [entries, setEntries] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<any>(null);
  const [viewUser, setViewUser] = useState<string | null>(null);

  // init from work order
  useEffect(() => {
    if (selectedWorkOrder?.timeEntries?.length) {
      setEntries(selectedWorkOrder.timeEntries);
    } else {
      setEntries([]);
    }
  }, [selectedWorkOrder]);

  // totals
  const totalMinutes = useMemo(
    () => entries.reduce((a, e) => a + (Number(e.totalMinutes ?? 0) || 0), 0),
    [entries]
  );

  // group by user
  const grouped = useMemo(() => {
    const map: Record<string, { items: any[]; total: number }> = {};
    for (const e of entries) {
      const name = e.user?.fullName || "Unknown";
      if (!map[name]) map[name] = { items: [], total: 0 };
      map[name].items.push(e);
      map[name].total += Number(e.totalMinutes ?? 0);
    }
    return map;
  }, [entries]);

  // local helpers
  const addLocal = (t: any) => setEntries((p) => [...p, t]);
  const updateLocal = (t: any) =>
    setEntries((p) => p.map((x) => (x.id === t.id ? { ...x, ...t } : x)));
  const deleteLocal = (id: string) =>
    setEntries((p) => p.filter((x) => x.id !== id));

  // create
  const handleAdd = async (data: any) => {
    try {
      // ensure primitive id
      const userId = typeof data.userId === "object" ? data.userId.id : data.userId;

      // API expects a single object (not items[])
      const apiPayload = {
        userId,
        totalMinutes: Number(data.totalMinutes ?? 0),
        entryType: (data.entryType ?? "work").toLowerCase(),
        rate: Number(data.rate || 0),
      };

      const res = await dispatch(addTimeEntry({ id: workOrderId!, data: apiPayload })).unwrap();
      toast.success("✅ Time entry added");

      const assignee = selectedWorkOrder?.assignees?.find((a: any) => a.id === userId);

      addLocal({
        ...apiPayload,
        id: res?.id || crypto.randomUUID?.() || String(Math.random()),
        user: { fullName: assignee?.fullName || user?.fullName || "Unknown" },
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to add time entry");
    }
  };

  // delete
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this time entry?")) return;
    try {
      await dispatch(deleteTimeEntry({ id: workOrderId!, entryId: id })).unwrap();
      toast.success("🗑️ Deleted successfully");
      deleteLocal(id);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete time entry");
    }
  };

  const Header = ({ title, onBack }: any) => (
    <div className="flex items-center justify-between p-4 bg-white sticky border top-0 z-30">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
      >
        <ArrowLeft className="h-5 w-5" />
        {title}
      </button>
      <button
        onClick={() => {
          setModalInitial(null);
          setIsModalOpen(true);
        }}
        className="border border-blue-500 text-blue-600 text-sm font-medium px-4 h-10 rounded-md hover:bg-blue-50 transition"
      >
        Add Time
      </button>
    </div>
  );

  const OverviewView = () => (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white">
      <div className="flex flex-col items-center justify-center py-10">
        {/* total */}
        <div className="flex items-center justify-center w-full max-w-3xl px-10" style={{ gap: "4rem" }}>
          <div className="flex flex-col items-center justify-center" style={{ width: 200, height: 180 }}>
            <h2 className="text-5xl font-semibold text-gray-900">
              {formatDuration(totalMinutes)}
            </h2>
            <p className="text-gray-600 mt-2">Total Logged Time</p>
          </div>

          <div style={{ width: 1, height: 120, backgroundColor: "#E5E7EB" }} />

          <div
            onClick={() => {
              if (user?.fullName) setViewUser(user.fullName);
            }}
            className="flex flex-col items-center justify-center hover:bg-blue-50 transition-all duration-300 rounded-md cursor-pointer"
            style={{ width: 200, height: 180 }}
          >
            <h2 className="text-5xl font-semibold text-gray-900">
              {formatDuration(totalMinutes)}
            </h2>
            <button
              className="mt-3 border border-blue-500 text-blue-600 text-sm font-medium px-5 h-9 rounded-md hover:bg-blue-100 transition"
              style={{ minWidth: 120 }}
            >
              My Time Entries
            </button>
          </div>
        </div>

        {/* by user */}
        <div className="w-full max-w-3xl mt-10">
          {Object.entries(grouped).map(([userName, data]) => {
            const sorted = [...data.items].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            return (
              <div key={userName} className="mb-10">
                <h2 className="text-3xl font-semibold text-gray-900 mb-3 px-3">
                  {userName}{" "}
                  <span className="text-gray-800">{formatDuration(data.total)}</span>
                </h2>

                {sorted.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded-md cursor-pointer"
                    onClick={() => {
                      setModalInitial(entry);
                      setIsModalOpen(true);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        alt="user"
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="text-base font-semibold text-gray-900">
                          {(entry.entryType || "work").charAt(0).toUpperCase() +
                            (entry.entryType || "work").slice(1)}
                          {" – "}
                          {formatDuration(entry.totalMinutes ?? 0)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Logged {timeAgo(entry.createdAt || Date.now())}
                        </div>
                        <div className="text-sm text-gray-700">
                          Rate: ${entry.rate ?? 0}/hr
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                ))}

                <div className="flex justify-end items-center text-sm text-gray-900 pr-2 mt-2">
                  <span className="mr-3">
                    1 – {data.items.length} of {data.items.length}
                  </span>
                  <ChevronLeft className="h-4 w-4 text-gray-300 mr-1" />
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const UserView = ({ userName }: { userName: string }) => {
    const userEntries = entries.filter(
      (e) => e.user?.fullName?.toLowerCase() === userName.toLowerCase()
    );
    const total = userEntries.reduce(
      (a, e) => a + (Number(e.totalMinutes ?? 0) || 0),
      0
    );

    return (
      <div className="flex-1 flex flex-col overflow-y-auto bg-white">
        <div className="flex flex-col items-center py-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="user"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h2 className="text-2xl font-semibold text-gray-900">{userName}</h2>
          <p className="text-lg text-gray-700 mb-6">{formatDuration(total)}</p>

          <div className="w-full max-w-3xl border-t pt-6 px-4">
            <h3 className="text-lg font-semibold mb-3">Entries</h3>

            {userEntries.map((entry) => (
              <div
                key={entry.id || entry.createdAt}
                className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded-md cursor-pointer"
                onClick={() => {
                  setModalInitial(entry);
                  setIsModalOpen(true);
                }}
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    alt="user"
                    className="w-10 h-10 rounded-full"
                  />
                <div>
                    <div className="text-blue-600 text-base font-semibold">
                      {formatDuration(entry.totalMinutes ?? 0)}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {(entry.entryType || "work").charAt(0).toUpperCase() +
                        (entry.entryType || "work").slice(1)}{" "}
                      – {timeAgo(entry.createdAt || Date.now())}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rate: ${entry.rate ?? 0}/hr
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col bg-white border-gray-200 rounded-md shadow-sm"
      style={{ height: "calc(100vh - 135px)" }}
    >
      {!viewUser ? (
        <>
          <Header title="Time Overview" onBack={onCancel} />
          <OverviewView />
        </>
      ) : (
        <>
          <Header title="My Time Entries" onBack={() => setViewUser(null)} />
          <UserView userName={viewUser} />
        </>
      )}

      {isModalOpen && (
        <AddTimeModal
          onClose={() => {
            setIsModalOpen(false);
            setModalInitial(null);
          }}
          workOrderId={workOrderId}
          selectedWorkOrder={selectedWorkOrder}
          initialTime={modalInitial}
          onAdd={handleAdd}
          onUpdate={(upd) => updateLocal(upd)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
