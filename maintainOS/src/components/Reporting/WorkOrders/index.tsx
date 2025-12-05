import { CreatedVsCompletedChart } from "./CreatedVsCompletedChart";
import { WorkOrdersByTypeChart } from "./WorkOrdersByTypeChart";

interface WorkOrdersTabProps {
  filters: Record<string, any>;
  dateRange: { startDate: string; endDate: string };
}

export function WorkOrdersTab({ filters, dateRange }: WorkOrdersTabProps) {
  console.log("🎯 WorkOrdersTab received filters:", filters);
  console.log("🎯 WorkOrdersTab received dateRange:", dateRange);

  return (
    <div className="space-y-6 pb-6">
      <CreatedVsCompletedChart filters={filters} dateRange={dateRange} />
      <WorkOrdersByTypeChart filters={filters} dateRange={dateRange} />
    </div>
  );
}
