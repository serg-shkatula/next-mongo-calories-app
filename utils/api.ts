export const entriesApiCall = (method: string, data: Record<string, unknown>) =>
  fetch('/api/entries', {
    method,
    body: JSON.stringify(data),
  });
