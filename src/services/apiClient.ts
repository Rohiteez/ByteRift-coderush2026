// Typed API Client for communicating with Aafno Pay backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  code: string;
  details?: Record<string, any>;

  constructor(message: string, code: string = 'API_ERROR', details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  let json: any;
  try {
    json = await res.json();
  } catch (err) {
    throw new ApiError(`Failed to parse server response (status: ${res.status})`, 'NETWORK_ERROR');
  }

  if (!res.ok || json.success === false) {
    const errorMsg = json?.error?.message || json?.message || `Request failed with status ${res.status}`;
    const errorCode = json?.error?.code || 'SERVER_ERROR';
    throw new ApiError(errorMsg, errorCode, json?.error?.details);
  }

  return json.data as T;
}

export const apiClient = {
  baseUrl: API_BASE_URL,

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET', signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: any): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },
};
