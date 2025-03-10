const onSubmit = async (data: { name: string }) => {
  try {
    const session = await getSession();
    if (!session || !session.accessToken) {
      throw new Error("❌ User session expired. Please log in again.");
    }

    const BASE_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080/api/v1";

    // ✅ Ensure `id` is included if required by the backend
    const payload = { name: data.name, email: user.email };

    console.log("📡 Sending update request with payload:", JSON.stringify(payload));

    const response = await fetch(`${BASE_API_URL}/api/v1/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`, // ✅ Include JWT
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Server responded with error:", errorData);
      throw new Error(errorData.message || "Failed to update profile");
    }

    alert("✅ Profile updated successfully!");
    setUser(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
    alert(errorMessage);
  }
};
