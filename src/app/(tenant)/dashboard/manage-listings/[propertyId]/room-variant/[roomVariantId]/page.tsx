import EditRoomVariant from "@/app/(tenant)/dashboard/manage-listings/[propertyId]/room-variant/[roomVariantId]/component/EditRoomVariant";
import ManagePeakRates from "@/app/(tenant)/dashboard/manage-listings/[propertyId]/room-variant/[roomVariantId]/component/ManagePeakRate";

const RoomVariantPage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <EditRoomVariant />
      <ManagePeakRates />
    </div>
  );
};

export default RoomVariantPage;
