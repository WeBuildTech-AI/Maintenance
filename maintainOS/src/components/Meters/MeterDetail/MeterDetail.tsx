"use client";

import { useState } from "react";
import { Building2, Edit, MapPin, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { MeterAutomations } from "./MeterAutomations";
import { MeterDetailsSection } from "./MeterDetailsSection";
import { MeterReadings } from "./MeterReadings";
import { MeterWorkOrders } from "./MeterWorkOrders";
import { NewMeterForm } from "../NewMeterForm/NewMeterForm";
import { useNavigate } from "react-router-dom"; // 👈 ADD useNavigate
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { formatDate } from "../../utils/Date";
import type { AppDispatch, RootState } from "../../../store";
import { useSelector } from "react-redux";

export function MeterDetail({ selectedMeter, handleDeleteMeter }: any) {
  // Removed local editing state: const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate(); // 👈 ADD hook

  // Removed conditional return for NewMeterForm
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <div className="flex border mr-2 flex-col h-full">
      {/* Header */}
      <div className="p-6 border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-medium capitalize">
            {selectedMeter.name}
          </h1>
          <div className="flex items-center gap-2">
            <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4" />
              Record Reading
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-orange-600"
              onClick={() => {
                // 🔽 Navigate to the new parameterized URL for editing
                navigate(`/meters/${selectedMeter.id}/edit`);
              }}
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="mt-2">
                  <DropdownMenuItem
                    onClick={() => handleDeleteMeter(selectedMeter?.id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          {selectedMeter?.assetId && (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>{selectedMeter.assetId}</span>
            </div>
          )}
          {selectedMeter?.locationId && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{selectedMeter.locationId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 space-y-8 overflow-auto">
        <MeterReadings selectedMeter={selectedMeter} />
        <MeterDetailsSection selectedMeter={selectedMeter} />
        <MeterAutomations />
        <MeterWorkOrders selectedMeter={selectedMeter} />
        {selectedMeter.createdAt === selectedMeter.updatedAt ? (
          <>
            <div className="text-sm text-gray-500 mt-6">
              Created By{" "}
              <span className="font-medium text-gray-700 capitalize">
                {user?.fullName}
              </span>{" "}
              on {formatDate(selectedMeter.createdAt)}
            </div>
          </>
        ) : (
          <>
            <div className="text-sm text-gray-500 mt-6">
              Created By{" "}
              <span className="font-medium text-gray-700 capitalize">
                {user?.fullName}
              </span>{" "}
              on {formatDate(selectedMeter.createdAt)}
            </div>
            <div className="text-sm text-gray-500 mt-6">
              Updated By{" "}
              <span className="font-medium text-gray-700 capitalize">
                {user?.fullName}
              </span>{" "}
              on {formatDate(selectedMeter.updatedAt)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
