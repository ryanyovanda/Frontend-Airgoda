"use server";

const getAllProperties = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch properties");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
};

export default getAllProperties; // ✅ Use default export
