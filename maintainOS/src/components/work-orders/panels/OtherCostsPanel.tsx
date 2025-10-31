"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react";
import AddCostModal from "../ToDoView/AddCostModal";

// helper
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

type Props = {
  onCancel: () => void;
  workOrderId?: string;
  selectedWorkOrder?: any;
};

export default function OtherCostsPanel({
  onCancel,
  workOrderId,
  selectedWorkOrder,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitial, setModalInitial] = useState<any>(null);
  const [viewCategory, setViewCategory] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<string | null>(null);
  const [costs, setCosts] = useState<any[]>([]);

  // get current user from Redux
  const user = useSelector((state: any) => state.auth?.user);

  // init from work order
  useEffect(() => {
    if (selectedWorkOrder?.otherCosts?.length) {
      setCosts(selectedWorkOrder.otherCosts);
    } else {
      setCosts([]);
    }
  }, [selectedWorkOrder]);

  // total cost
  const totalCost = useMemo(
    () => costs.reduce((a, c) => a + (Number(c.amount ?? c.cost ?? 0) || 0), 0),
    [costs]
  );

  // group by category and then by user
  const grouped = useMemo(() => {
    const map: Record<
      string,
      { title: string; items: any[]; total: number; users: Record<string, any[]> }
    > = {};
    for (const c of costs) {
      const cat = (c.category || "other").toLowerCase();
      const title = cat.charAt(0).toUpperCase() + cat.slice(1);
      if (!map[cat])
        map[cat] = { title, items: [], total: 0, users: {} };
      map[cat].items.push(c);
      map[cat].total += Number(c.amount ?? c.cost ?? 0) || 0;

      const userName = c.user?.fullName || "Unknown";
      if (!map[cat].users[userName]) map[cat].users[userName] = [];
      map[cat].users[userName].push(c);
    }
    return map;
  }, [costs]);

  // header
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
        Add Cost
      </button>
    </div>
  );

  // Overview
  const OverviewView = () => (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white">
      <div className="flex flex-col items-center justify-center py-10">
        {/* total block */}
        <div
          className="flex items-center justify-center w-full max-w-3xl px-10"
          style={{ gap: "4rem" }}
        >
          <div className="flex flex-col items-center justify-center" style={{ width: 200, height: 180 }}>
            <h2 className="text-5xl font-semibold text-gray-900">${totalCost.toFixed(2)}</h2>
            <p className="text-gray-600 mt-2">Total Other Costs</p>
          </div>

          <div style={{ width: 1, height: 120, backgroundColor: "#E5E7EB" }} />

          <div
            onClick={() => {
              if (user?.fullName) setViewUser(user.fullName);
            }}
            className="flex flex-col items-center justify-center hover:bg-blue-50 transition-all duration-300 rounded-md cursor-pointer"
            style={{ width: 200, height: 180 }}
          >
            <h2 className="text-5xl font-semibold text-gray-900">${totalCost.toFixed(2)}</h2>
            <button
              className="mt-3 border border-blue-500 text-blue-600 text-sm font-medium px-5 h-9 rounded-md hover:bg-blue-100 transition"
              style={{ minWidth: 120 }}
            >
              My Other Costs
            </button>
          </div>
        </div>

        {/* category sections */}
        <div className="w-full max-w-3xl mt-10">
          {Object.keys(grouped).map((cat) => {
            const catData = grouped[cat];
            return (
              <div key={cat} className="mb-10">
                <h2 className="text-3xl font-semibold text-gray-900 mb-3 px-3">
                  {catData.title}{" "}
                  <span className="text-gray-800">${catData.total.toFixed(2)}</span>
                </h2>

                {Object.entries(catData.users).map(([userName, entries]: [string, any[]]) => {
                  const sorted = [...entries].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  );
                  const lastEntry = sorted[0];
                  const subtotal = entries.reduce(
                    (a, e) => a + (Number(e.amount ?? e.cost ?? 0) || 0),
                    0
                  );

                  return (
                    <div
                      key={userName}
                      className="flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded-md cursor-pointer"
                      onClick={() => setViewUser(userName)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                          alt="user"
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="text-base font-semibold text-gray-900">{userName}</div>
                          <div className="text-sm text-gray-600">
                            Last entry {timeAgo(lastEntry?.createdAt || Date.now())}
                          </div>
                          <div className="text-sm text-gray-700">
                            ${subtotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  );
                })}

                <div className="flex justify-end items-center text-sm text-gray-900 pr-2 mt-2">
                  <span className="mr-3">
                    1 – {catData.items.length} of {catData.items.length}
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

  // User View (across all categories)
  const UserView = ({ userName }: { userName: string }) => {
    const entries = costs.filter(
      (c) => c.user?.fullName?.toLowerCase() === userName.toLowerCase()
    );
    const total = entries.reduce(
      (a, c) => a + (Number(c.amount ?? c.cost ?? 0) || 0),
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
          <p className="text-lg text-gray-700 mb-6">${total.toFixed(2)}</p>

          <div className="w-full max-w-3xl border-t pt-6 px-4">
            <h3 className="text-lg font-semibold mb-3">Entries</h3>

            {entries.map((entry) => (
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
                    <a className="text-blue-600 text-base font-semibold" href="#">
                      ${Number(entry.amount ?? entry.cost ?? 0).toFixed(2)}
                    </a>
                    <p className="text-sm font-semibold text-gray-900">
                      {entry.category || "Other"} – Created {timeAgo(entry.createdAt || Date.now())}
                    </p>
                    <p className="text-sm text-gray-500">
                      {entry.description || "No description"}
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

  // handlers
  const addLocal = (c: any) => setCosts((p) => [...p, c]);
  const updateLocal = (c: any) =>
    setCosts((p) => p.map((x) => (x.id === c.id ? { ...x, ...c } : x)));
  const deleteLocal = (id: string) =>
    setCosts((p) => p.filter((x) => x.id !== id));

  return (
    <div
      className="flex flex-col bg-white border-gray-200 rounded-md shadow-sm"
      style={{ height: "calc(100vh - 135px)" }}
    >
      {!viewUser ? (
        <>
          <Header title="Other Costs Overview" onBack={onCancel} />
          <OverviewView />
        </>
      ) : (
        <>
          <Header title="My Other Costs" onBack={() => setViewUser(null)} />
          <UserView userName={viewUser} />
        </>
      )}

      {isModalOpen && (
        <AddCostModal
          onClose={() => setIsModalOpen(false)}
          workOrderId={workOrderId}
          selectedWorkOrder={selectedWorkOrder}
          initialCost={modalInitial}
          onAdd={(newCost) => {
            const costWithTime = {
              ...newCost,
              id: crypto.randomUUID?.() || String(Math.random()),
              createdAt: new Date().toISOString(),
            };
            addLocal(costWithTime);
          }}
          onUpdate={(upd) => updateLocal(upd)}
          onDelete={(id) => deleteLocal(id)}
        />
      )}
    </div>
  );
}
