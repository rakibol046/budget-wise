const listResponses = [
  [/^\/categories\/?$/, 'categories'],
  [/^\/accounts\/?$/, 'accounts'],
  [/^\/currencies\/?$/, 'currencies'],
  [/^\/expenses(?:\/yearly\/\d{4})?\/?$/, 'expenses'],
];

// SPA fallbacks can return index.html with HTTP 200. Reject it before a store
// replaces its initial arrays with undefined and crashes the page.
export const validateApiResponse = (response) => {
  const { data, config } = response;
  const path = (config.url || '').split('?')[0];
  const listKey = config.method === 'get'
    ? listResponses.find(([pattern]) => pattern.test(path))?.[1]
    : null;

  if (!data || typeof data !== 'object' || data.success !== true ||
      (listKey && !Array.isArray(data[listKey]))) {
    throw new Error('Unable to load data from the server. Please try again later.');
  }

  return response;
};
