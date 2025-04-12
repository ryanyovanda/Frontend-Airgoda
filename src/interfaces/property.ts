export interface Location {
    id: number;
    name: string;
    parent: Location | null;
    type: string;
  }
  
export interface Category {
    id: number;
    name: string;
  }
  
 export interface Property {
    id: string;
    name: string;
    description: string;
    categoryId: string;
    locationId: string;
    fullAddress: string;
    isActive: boolean;
    imageIds: number[];
    imageUrls: string[];
    location: { id: string; name: string } | null;
    totalRoomVariants: number;
  }

  export interface PropertyListProps {
    initialCategories: Category[];
    initialLocations: Location[];
  }

  
  export interface PropertyDetailsProps {
    data: {
      id: number;
      name: string;
      description: string;
      location?: { name?: string };
      imageUrls?: string[];
    };
  }