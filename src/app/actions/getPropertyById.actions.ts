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

    const property = await response.json(); // Changed 'let' to 'const'

    // Fetch room variants for this property
    const roomResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/room-variants/property/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    return {
      ...property,
      roomVariants: roomResponse.ok ? await roomResponse.json() : [],
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default getPropertyById;
