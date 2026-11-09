const AUTH_TOKEN_STORAGE_KEY = 'token';

export const HttpMethod = Object.freeze({
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
});

export class ApiError extends Error {
  constructor(status, message, payload) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export const getBackendUrl = () => import.meta.env.VITE_BACKEND_URL ?? '';

export const buildAssetUrl = (assetPath) =>
  assetPath ? `${getBackendUrl()}${assetPath}` : null;

export const getAuthToken = () => localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

export const storeAuthToken = (token) =>
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);

export const clearAuthToken = () =>
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);

export const isAuthenticated = () => Boolean(getAuthToken());

const parseResponseBody = async (response) => {
  const contentType = response.headers.get('content-type') ?? '';

  return contentType.includes('application/json')
    ? response.json()
    : response.text();
};

export const apiRequest = async (
  path,
  { method = HttpMethod.GET, body, formData } = {}
) => {
  const token = getAuthToken();
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${getBackendUrl()}${path}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const payload = await parseResponseBody(response);
  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload?.message
        ? payload.message
        : response.statusText;
    throw new ApiError(response.status, message, payload);
  }

  return payload;
};
