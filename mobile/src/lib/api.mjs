export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function createApi({
  baseUrl,
  getToken,
  onUnauthorized,
  fetchImpl = fetch,
  timeout = 15000,
}) {
  const base = baseUrl.replace(/\/+$/, "");
  return async function request(
    path,
    { method = "GET", body, authenticated = true } = {},
  ) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const token = authenticated ? getToken() : null;
    try {
      const response = await fetchImpl(`${base}${path}`, {
        method,
        headers: {
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        signal: controller.signal,
      });
      let data;
      try {
        data = await response.json();
      } catch {
        throw new ApiError(
          "The server returned an unexpected response. Please try again.",
          response.status,
        );
      }
      if (!response.ok) {
        // A wrong current password also returns 401. Only protected GET failures
        // indicate an expired session; login and password errors remain in their form.
        if (response.status === 401 && token && method === "GET")
          onUnauthorized?.(token);
        throw new ApiError(
          data.message || "The request failed. Please try again.",
          response.status,
        );
      }
      return data;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error.name === "AbortError"
          ? "The server took too long to respond. Please try again."
          : "Cannot reach BudgetWise. Check your internet connection and try again.",
      );
    } finally {
      clearTimeout(timer);
    }
  };
}
