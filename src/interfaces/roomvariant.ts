export interface RoomVariant {
    id: number;
    name: string;
    propertyId: number;
    price: number;
    facilities?: string[];
  }

  export interface PeakRate {
    id: number;
    roomVariantId: number;
    startDate: string;
    endDate: string;
    additionalPrice: number;
  }
  