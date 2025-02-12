"use server";

const getPropertyById = async (id: number) => {
  try {
    // Fetch property details by ID
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch property details");
    }

    let property = await response.json();

    // Fetch room variants for this property
    const roomResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room-variants/property/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (roomResponse.ok) {
      property.roomVariants = await roomResponse.json();
    } else {
      property.roomVariants = [];
    }

    return property;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getPropertyById;
