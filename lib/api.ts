const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      data?.error ?? "Une erreur est survenue. Merci de réessayer.",
      res.status,
      data?.details
    );
  }

  return data as T;
}

export type SafeUser = {
  id: string;
  cabinetId: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "STANDARD";
};

export type Cabinet = {
  id: string;
  name: string;
  city: string | null;
};

export type AuthResponse = {
  token: string;
  user: SafeUser;
  cabinet?: Cabinet;
};

export const api = {
  registerCabinet: (input: {
    cabinetName: string;
    city?: string;
    fullName: string;
    email: string;
    password: string;
  }) => request<AuthResponse>("/api/auth/register-cabinet", { method: "POST", body: input }),

  login: (input: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: input }),

  forgotPassword: (input: { email: string }) =>
    request<{ message: string }>("/api/auth/forgot-password", { method: "POST", body: input }),

  resetPassword: (input: { token: string; password: string }) =>
    request<{ message: string }>("/api/auth/reset-password", { method: "POST", body: input }),

  me: (token: string) => request<{ user: SafeUser; cabinet: Cabinet }>("/api/auth/me", { token }),
};
