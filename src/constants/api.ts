export async function fetchData(
  endpoint: string,
  method: string = "GET",
  body?: Record<string, unknown> | null
) {
  const session = await fetch("/api/auth/session").then((res) => res.json());

  const fetchWithAuth = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
      method: method,
      headers: {
        Authorization: `Bearer ${session?.user?.jwt}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 401) {
      // ✅ Attempt to refresh token
      const refreshRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: session?.user?.refreshToken }),
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        session.user.jwt = data.accessToken;

        return fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
          method: method,
          headers: {
            Authorization: `Bearer ${session?.user?.jwt}`,
            "Content-Type": "application/json",
          },
          body: body ? JSON.stringify(body) : null,
        });
      }
    }

    return res;
  };

  return fetchWithAuth();
}
