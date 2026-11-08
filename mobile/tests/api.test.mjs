import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, createApi } from "../src/lib/api.mjs";

test("uses the production API path, bearer token, and JSON payload", async () => {
  let sent;
  const api = createApi({
    baseUrl: "https://example.test/_/backend/api/",
    getToken: () => "test-token",
    fetchImpl: async (...args) => {
      sent = args;
      return Response.json({ success: true });
    },
  });
  await api("/expenses", {
    method: "POST",
    body: { amount: 12.5, accountId: null },
  });
  assert.equal(sent[0], "https://example.test/_/backend/api/expenses");
  assert.equal(sent[1].headers.Authorization, "Bearer test-token");
  assert.deepEqual(JSON.parse(sent[1].body), { amount: 12.5, accountId: null });
});
test("login errors and wrong current password do not clear a valid session", async () => {
  let expired = false;
  const api = createApi({
    baseUrl: "https://example.test",
    getToken: () => "token",
    onUnauthorized: () => {
      expired = true;
    },
    fetchImpl: async () =>
      Response.json({ message: "Incorrect password" }, { status: 401 }),
  });
  await assert.rejects(
    api("/auth/login", { method: "POST", authenticated: false }),
    /Incorrect password/,
  );
  await assert.rejects(
    api("/auth/password", { method: "PUT", body: {} }),
    /Incorrect password/,
  );
  assert.equal(expired, false);
});
test("expired authenticated GET tells the session which token failed", async () => {
  let rejected;
  const api = createApi({
    baseUrl: "https://example.test",
    getToken: () => "old-token",
    onUnauthorized: (token) => {
      rejected = token;
    },
    fetchImpl: async () =>
      Response.json({ message: "Token expired" }, { status: 401 }),
  });
  await assert.rejects(
    api("/auth/me"),
    (error) => error instanceof ApiError && error.status === 401,
  );
  assert.equal(rejected, "old-token");
});
test("public login does not send a previously stored bearer token", async () => {
  const api = createApi({
    baseUrl: "https://example.test",
    getToken: () => "old-token",
    fetchImpl: async (_url, options) => {
      assert.equal(options.headers.Authorization, undefined);
      return Response.json({});
    },
  });
  await api("/auth/login", { method: "POST", authenticated: false });
});
test("HTML responses and network failures produce actionable errors", async () => {
  const html = createApi({
    baseUrl: "https://example.test",
    getToken: () => null,
    fetchImpl: async () => new Response("<html>Not an API</html>"),
  });
  await assert.rejects(html("/health"), /unexpected response/);
  const offline = createApi({
    baseUrl: "https://example.test",
    getToken: () => null,
    fetchImpl: async () => {
      throw new TypeError("Failed to fetch");
    },
  });
  await assert.rejects(offline("/health"), /Check your internet connection/);
});
test("aborts a slow request and reports a timeout", async () => {
  const api = createApi({
    baseUrl: "https://example.test",
    getToken: () => null,
    timeout: 10,
    fetchImpl: (_url, { signal }) =>
      new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      }),
  });
  await assert.rejects(api("/health"), /too long/);
});
