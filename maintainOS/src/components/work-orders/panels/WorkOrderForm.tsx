import WorkOrderName from "../parts/WorkOrderName";
import UploadPictures from "../parts/UploadPictures";
import DescriptionField from "../parts/DescriptionField";
import LocationField from "../parts/LocationField";
import AssetsField from "../parts/AssetsField";
import ProcedureField from "../parts/ProcedureField";
import AssignedTo from "../parts/AssignedTo";
import EstimatedTime from "../parts/EstimatedTime";
import DatePickerField from "../parts/DatePickerField";
import RecurrenceField from "../parts/RecurrenceField";
import PriorityField from "../parts/PriorityField";
import WorkOrderIdField from "../parts/WorkOrderIdField";
import TeamsField from "../parts/TeamsField";
import QRCodeField from "../parts/QRCodeField";
import WorkOrderTypes from "../parts/WorkOrderTypes";
import PartsField from "../parts/PartsField";
import CategoriesField from "../parts/CategoriesField";
import VendorsField from "../parts/VendorsField";

export default function WorkOrderForm({
  setPanel,
  onOpenProcedure,
}: {
  setPanel: (p: any) => void;
  onOpenProcedure: () => void;
}) {
  return (
    <>
      <WorkOrderName />
      <UploadPictures />
      <DescriptionField />
      <LocationField />
      <AssetsField setPanel={setPanel} />
      <ProcedureField onOpen={onOpenProcedure} />
      <AssignedTo setPanel={setPanel} />
      <EstimatedTime />
      <DatePickerField label="Start Date" />
      <DatePickerField label="Due Date" />
      <RecurrenceField />
      <PriorityField />
      <WorkOrderIdField />
      <TeamsField />
      <QRCodeField />
      <WorkOrderTypes />
      <PartsField />
      <CategoriesField />
      <VendorsField />
    </>
  );
}
