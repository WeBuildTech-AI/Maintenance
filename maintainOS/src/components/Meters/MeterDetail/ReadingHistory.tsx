import { ArrowLeft, Plus, User } from "lucide-react";
import { Button } from "../../ui/button";
import { format } from "date-fns";
import type { RootState } from "../../../store";
import { useSelector } from "react-redux";

export function ReadingHistory({
  selectedMeter,
  onBack,
  setIsRecordModalOpen,
}: any) {
  const user = useSelector((state: RootState) => state.auth.user);
  return (
    <div className="flex border mr-2 flex-col h-full bg-white">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2  ">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="hover:bg-gray-100 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <h2 className="text-lg font-semibold text-gray-800">
            Reading History
          </h2>
        </div>

        <Button
          onClick={() => setIsRecordModalOpen(true)}
          className="gap-2 bg-orange-50 text-orange-600  border border-orange-600"
        >
          <Plus className="h-4 w-4" />
          Record Reading
        </Button>
      </div>

      {/* Reading List */}
      <div className="flex-1 overflow-auto space-y-3 ">
        {selectedMeter?.readings?.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">No readings yet.</div>
        ) : (
          selectedMeter.readings &&
          selectedMeter.readings
            .sort(
              (a: any, b: any) =>
                new Date(b.timestamp).valueOf() -
                new Date(a.timestamp).valueOf()
            )
            .map((r: any) => (
              <div key={r.id} className="border-b p-2 last:border-none ">
                <div className="text-sm font-medium text-gray-800 ml-3">
                  {r.value}{" "}
                  {selectedMeter.measurement && selectedMeter.measurement.name}
                </div>
                <div className="text-sm text-gray-500 mt-1 ml-3">
                  {format(new Date(r.timestamp), "d MMM yyyy - HH:mm:ss")}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1 ml-3">
                  <User className="h-3 w-3 text-orange-600" />
                  Recorded by
                  <span className="font-medium text-gray-700 capitalize ">
                    {user?.fullName || "Unknown"}
                  </span>{" "}
                  manually
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
