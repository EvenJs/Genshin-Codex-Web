import { getToken, getRefreshToken, setTokens, clearAllTokens } from './authToken';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Prevent concurrent refresh requests
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshAccessToken();
  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const executeRequest = async (token: string | null) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const method = options?.method?.toUpperCase() ?? 'GET';
    const isGet = method === 'GET';

    return fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      ...(isGet && { cache: 'no-store' as const }),
    });
  };

  let response = await executeRequest(getToken());

  // If 401 and not a refresh request, try to refresh token
  if (response.status === 401 && !path.includes('/auth/refresh')) {
    const refreshed = await tryRefresh();

    if (refreshed) {
      // Retry with new token
      response = await executeRequest(getToken());
    } else {
      // Refresh failed, clear tokens and redirect
      clearAllTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Session expired');
    }
  }

  if (response.status === 401) {
    clearAllTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(response.status, errorText || response.statusText);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
