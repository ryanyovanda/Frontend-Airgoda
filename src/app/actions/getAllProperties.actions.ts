"use server";

const getAllProperties = async (page = 0, size = 10, categoryId = null) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (categoryId) queryParams.append("categoryId", categoryId); // ✅ Add category filter

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/properties/filter?${queryParams.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch properties");
    }

    const data = await response.json();
    console.log("Filtered Properties Response:", data); // ✅ Debugging log

    return {
      content: data.content || [],
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { content: [], totalPages: 1 };
  }
};

export default getAllProperties;
