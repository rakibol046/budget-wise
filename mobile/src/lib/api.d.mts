export class ApiError extends Error {
  status: number;
  constructor(message: string, status?: number);
}
export type RequestOptions = {
  method?: string;
  body?: unknown;
  authenticated?: boolean;
};
export function createApi(options: {
  baseUrl: string;
  getToken: () => string | null;
  onUnauthorized?: (token: string) => void;
  fetchImpl?: typeof fetch;
  timeout?: number;
}): <T = any>(path: string, options?: RequestOptions) => Promise<T>;
