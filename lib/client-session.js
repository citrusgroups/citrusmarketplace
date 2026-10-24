// A failed request is not evidence that a session has expired.
export async function readClientSession(fetcher = fetch) {
  try {
    const response = await fetcher("/api/auth/me", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (response.status === 401) return { status: "signed-out" };
    if (!response.ok) return { status: "unavailable" };
    const data = await response.json();
    return data.user
      ? { status: "signed-in", user: data.user }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}
