import { useState } from "react";
import {
  ChevronLeft,
  Download,
  Plus,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import type { Asset } from "../../Assets";
import {
  AssetStatusReadings,
  UpdateAssetStatusModal,
} from "./AssetStatusReadings";

interface StatusEntry {
  status: "online" | "offline" | "do-not-track";
  updatedBy: string;
  date: string;
  duration: string;
  icon: string;
}

interface TimelineData {
  type: "online" | "offline";
  start: string;
  end: string;
  color: string;
}

type Period = "1H" | "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "Custom";
type StatusType = "offline" | "online" | "do-not-track";

interface AssetStatusMoreDetailsProps {
  setSeeMoreAssetStatus: (value: boolean) => void;
  asset: Asset;
}

export default function AssetStatusMoreDetails({
  setSeeMoreAssetStatus,
  asset,
}: AssetStatusMoreDetailsProps) {
  //   const navigate = useNavigate();
  // const [selectedStatus, setSelectedStatus] = useState<StatusType>("offline");
  const [seeMoreFlag, setSeeMoreFlag] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("1W");
  const [selectedEntry, setSelectedEntry] = useState<number>(0);
  const [updateAssetModal, setUpdateAssetModal] = useState(false);

  const statusHistory: StatusEntry[] = [
    {
      status: "offline",
      updatedBy: "Sidrt Srivastava",
      date: "31/10/2025",
      duration: "2 days, 23h 57m",
      icon: "👤",
    },
    {
      status: "online",
      updatedBy: "Sidrt Srivastava",
      date: "31/10/2025",
      duration: "46m",
      icon: "👤",
    },
    {
      status: "offline",
      updatedBy: "Sidrt Srivastava",
      date: "31/10/2025",
      duration: "< 1m",
      icon: "👤",
    },
    {
      status: "online",
      updatedBy: "Sidrt Srivastava",
      date: "31/10/2025",
      duration: "1 day, 1h 6m",
      icon: "👤",
    },
  ];

  const timelineData: TimelineData[] = [
    {
      type: "online",
      start: "28 Oct 12:00",
      end: "29 Oct 12:00",
      color: "bg-teal-400",
    },
    {
      type: "online",
      start: "30 Oct 12:00",
      end: "31 Oct 12:00",
      color: "bg-teal-400",
    },
    {
      type: "offline",
      start: "1 Nov 12:00",
      end: "3 Nov 12:00",
      color: "bg-red-500",
    },
  ];

  const periods: Period[] = [
    "1H",
    "1D",
    "1W",
    "1M",
    "3M",
    "6M",
    "1Y",
    "Custom",
  ];

  return (
    <div className="min-h-screen p-4">
      <div className="">
        <div className="max-w-7xl mx-auto bg-white ">
          {/* Header */}
          <div className="flex justify-between item-center gap-6 p-6">
            <h1 className="text-2xl font-semibold">Assets</h1>
            <button>New Asset</button>
          </div>
          <div className="border">
            <div className="border-b border-gray-200">
              <div className="flex items-center justify-between  overflow-x-auto mb-4 border-b">
                <div className="flex items-center gap-2 text-xl p-6">
                  <div
                    className="flex item-center "
                    onClick={() => setSeeMoreAssetStatus(false)}
                  >
                    <ChevronLeft className="w-4 h-4 text-blue-600 mt-2 " />
                    <span className="text-blue-600 cursor-pointer">
                      {asset.name}
                    </span>
                  </div>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-700 ">Status</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-6">
                <div>
                  <AssetStatusReadings
                    asset={asset}
                    seeMoreFlag={seeMoreFlag}
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Status History Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Status History
                </h2>
                <div className="flex items-center gap-2">
                  {periods.map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`px-3 py-1 text-xs font-medium rounded ${
                        selectedPeriod === period
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="mb-8 bg-white rounded border border-gray-200 p-4">
                <div className="space-y-3">
                  {/* Online */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 w-20">Online</span>
                    <div className="flex-1 relative h-6 bg-gray-50 rounded">
                      <div className="absolute left-[15%] w-[35%] h-full bg-teal-400 rounded"></div>
                      <div className="absolute left-[60%] w-[15%] h-full bg-teal-400 rounded"></div>
                    </div>
                  </div>
                  {/* Offline */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 w-20">Offline</span>
                    <div className="flex-1 relative h-6 bg-gray-50 rounded">
                      <div className="absolute left-[75%] w-[25%] h-full bg-red-500 rounded"></div>
                    </div>
                  </div>
                  {/* Do Not Track */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-600 w-20">
                      Do Not Track
                    </span>
                    <div className="flex-1 relative h-6 bg-gray-50 rounded"></div>
                  </div>
                </div>

                {/* Timeline dates */}
                <div className="flex justify-between mt-2 text-xs text-gray-500 px-24">
                  <span>28 Oct 12:00</span>
                  <span>29 Oct 12:00</span>
                  <span>30 Oct 12:00</span>
                  <span>31 Oct 12:00</span>
                  <span>1 Nov 12:00</span>
                  <span>2 Nov 12:00</span>
                  <span>3 Nov 12:00</span>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded border border-gray-200">
                <div>
                  <div className="text-2xl font-semibold text-gray-800">
                    77h
                  </div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-800">
                    72h
                  </div>
                  <div className="text-sm text-gray-600">
                    Unplanned Downtime
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-semibold text-gray-800">0h</div>
                  <div className="text-sm text-gray-600">Planned Downtime</div>
                </div>
              </div>

              {/* Add Manual Downtime Button */}
              <button
                onClick={() => setUpdateAssetModal(!updateAssetModal)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium mb-6"
              >
                <Plus className="w-4 h-4" />
                Add Manual Downtime
              </button>

              {/* Status Table */}
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                            Status
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                            Updated By
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                            Duration
                          </th>
                          <th className="w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {statusHistory.map((entry, index) => (
                          <tr
                            key={index}
                            onClick={() => setSelectedEntry(index)}
                            className={`border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                              selectedEntry === index ? "bg-blue-50" : ""
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    entry.status === "offline"
                                      ? "bg-red-500"
                                      : "bg-green-500"
                                  }`}
                                ></span>
                                <span className="text-sm text-gray-700 capitalize">
                                  {entry.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                                  👤
                                </div>
                                <span className="text-sm text-gray-700">
                                  {entry.updatedBy}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {entry.date}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-700">
                                {entry.duration}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Details Panel */}
                <div className="w-80 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="font-semibold text-gray-800">
                        Offline
                      </span>
                    </div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-2xl font-semibold text-gray-800 mb-1">
                        {statusHistory[selectedEntry].duration}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Downtime Type
                      </div>
                      <div className="text-sm text-gray-700">Unplanned</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">From</div>
                      <div className="text-sm text-gray-700">
                        31/10/2025, 18:03
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Created By
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                          👤
                        </div>
                        <span className="text-sm text-gray-700">
                          Sidrt Srivastava
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Updated By
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-xs">
                          👤
                        </div>
                        <span className="text-sm text-gray-700">
                          Sidrt Srivastava
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 mb-1">Note</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {updateAssetModal && <UpdateAssetStatusModal asset={asset} />}
      </div>
    </div>
  );
}
