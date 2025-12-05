import { CreatedVsCompletedChart } from "./CreatedVsCompletedChart";
import { WorkOrdersByTypeChart } from "./WorkOrdersByTypeChart";

export function WorkOrdersTab() {
  return (
    <div className="space-y-6 pb-6">
      <CreatedVsCompletedChart />
      <WorkOrdersByTypeChart />
    </div>
  );
}
