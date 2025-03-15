import EditRoomVariant from "@/app/dashboard/manage-listings/[propertyId]/room-variant/[roomVariantId]/component/edit/EditRoomVariant";
import ManagePeakRates from "@/app/dashboard/manage-listings/[propertyId]/room-variant/[roomVariantId]/component/managepeakrate/ManagePeakRates";

const RoomVariantPage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <EditRoomVariant />
      <ManagePeakRates />
    </div>
  );
};

export default RoomVariantPage;
