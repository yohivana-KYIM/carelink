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

  if (res.status === 204) {
    return undefined as T;
  }

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

export type UserRole = "SUPERADMIN" | "ADMIN" | "STANDARD";
export type CabinetStatus = "PENDING" | "ACTIVE" | "REJECTED";

export type SafeUser = {
  id: string;
  cabinetId: string | null;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type Cabinet = {
  id: string;
  name: string;
  city: string | null;
  status: CabinetStatus;
  whatsappPhoneNumber: string | null;
  defaultRelanceMonths: number;
  validatedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  users?: Array<{ id: string; fullName: string; email: string; createdAt: string }>;
  _count?: { users: number; patients: number; appointments: number };
};

export type AuthResponse = {
  token: string;
  user: SafeUser;
  cabinet: Cabinet | null;
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type PaginatedNotifications = {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type TeamMember = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type DashboardSummary = {
  todayCount: number;
  weekCount: number;
  confirmationRate: number | null;
  recoveredByRelance: number;
  statusBreakdown: Array<{ status: string; count: number }>;
};

export type PaginatedCabinets = {
  cabinets: Cabinet[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PlatformStats = {
  totalCabinets: number;
  pendingCabinets: number;
  activeCabinets: number;
  rejectedCabinets: number;
  totalUsers: number;
};

function authed<T>(token: string, path: string, options: { method?: string; body?: unknown } = {}) {
  return request<T>(path, { ...options, token });
}

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

  me: (token: string) =>
    request<{ user: SafeUser; cabinet: Cabinet | null }>("/api/auth/me", { token }),

  dashboardSummary: (token: string) =>
    authed<{ summary: DashboardSummary }>(token, "/api/dashboard/summary"),

  listTeam: (token: string) => authed<{ members: TeamMember[] }>(token, "/api/team"),

  createTeamMember: (
    token: string,
    input: { fullName: string; email: string; password: string }
  ) => authed<{ member: TeamMember }>(token, "/api/team", { method: "POST", body: input }),

  deleteTeamMember: (token: string, id: string) =>
    authed<void>(token, `/api/team/${id}`, { method: "DELETE" }),

  listNotifications: (token: string, params: { page?: number; unreadOnly?: boolean } = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.unreadOnly) query.set("unreadOnly", "true");
    const qs = query.toString();
    return authed<PaginatedNotifications>(token, `/api/notifications${qs ? `?${qs}` : ""}`);
  },

  markNotificationRead: (token: string, id: string) =>
    authed<{ notification: Notification }>(token, `/api/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllNotificationsRead: (token: string) =>
    authed<{ updated: number }>(token, "/api/notifications/read-all", { method: "PATCH" }),

  deleteNotification: (token: string, id: string) =>
    authed<void>(token, `/api/notifications/${id}`, { method: "DELETE" }),

  bulkDeleteNotifications: (token: string, ids: string[]) =>
    authed<{ deleted: number }>(token, "/api/notifications/bulk-delete", {
      method: "POST",
      body: { ids },
    }),

  deleteAllNotifications: (token: string) =>
    authed<{ deleted: number }>(token, "/api/notifications", { method: "DELETE" }),

  adminListCabinets: (
    token: string,
    params: { page?: number; status?: CabinetStatus; search?: string } = {}
  ) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return authed<PaginatedCabinets>(token, `/api/admin/cabinets${qs ? `?${qs}` : ""}`);
  },

  adminApproveCabinet: (token: string, id: string) =>
    authed<{ cabinet: Cabinet }>(token, `/api/admin/cabinets/${id}/approve`, { method: "POST" }),

  adminRejectCabinet: (token: string, id: string, reason?: string) =>
    authed<{ cabinet: Cabinet }>(token, `/api/admin/cabinets/${id}/reject`, {
      method: "POST",
      body: { reason },
    }),

  adminStats: (token: string) => authed<{ stats: PlatformStats }>(token, "/api/admin/stats"),
};
