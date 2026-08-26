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
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error ?? "Une erreur est survenue.", res.status, data?.details);
  }
  return data as T;
}

function authed<T>(token: string, path: string, options: { method?: string; body?: unknown } = {}) {
  return request<T>(path, { ...options, token });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "SUPERADMIN" | "ADMIN" | "STANDARD";
export type CabinetStatus = "PENDING" | "ACTIVE" | "REJECTED";
export type AppointmentStatus =
  | "PENDING" | "CONFIRMED" | "RESCHEDULE_REQUESTED"
  | "NO_RESPONSE" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export type SafeUser = {
  id: string;
  cabinetId: string | null;
  fullName: string;
  email: string;
  role: UserRole;
  notifPushEnabled?: boolean;
  notifEmailEnabled?: boolean;
  avatarUrl?: string | null;
  twoFactorEnabled?: boolean;
  createdAt: string;
};

export type TwoFactorRequiredResponse = { twoFactorRequired: true; challengeId: string };

export type Cabinet = {
  id: string;
  name: string;
  city: string | null;
  status: CabinetStatus;
  whatsappPhoneNumber: string | null;
  whatsappVerifiedAt?: string | null;
  aiRelanceEnabled?: boolean;
  evolutionInstanceName?: string | null;
  evolutionConnectedAt?: string | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  defaultRelanceMonths: number;
  reminder1MinBefore?: number;
  reminder2MinBefore?: number;
  reminder3MinBefore?: number | null;
  validatedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  users?: Array<{ id: string; fullName: string; email: string; createdAt: string }>;
  _count?: { users: number; patients: number; appointments: number };
};

export type AuthResponse = { token: string; user: SafeUser; cabinet: Cabinet | null };

export type Testimonial = {
  id: string;
  authorName: string;
  authorRole: string | null;
  rating: number | null;
  message: string;
  visible: boolean;
  likes: number;
  dislikes: number;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
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

export type TeamMember = { id: string; fullName: string; email: string; role: UserRole; createdAt: string };

export type MessageLog = {
  id: string;
  type: string;
  content: string;
  direction: string;
  createdAt: string;
};

export type RelanceStatus = "SENT" | "REPLIED" | "REBOOKED";

export type Relance = {
  id: string;
  patientId: string;
  content: string;
  aiGenerated: boolean;
  createdAt: string;
  replied: boolean;
  rebooked: boolean;
  status: RelanceStatus;
  patient: { id: string; fullName: string; phoneNumber: string };
};

export type Practitioner = { id: string; cabinetId: string; fullName: string; createdAt: string };

export type Patient = {
  id: string;
  cabinetId: string;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  whatsappOptIn: boolean;
  whatsappOptInAt: string | null;
  lastVisitAt: string | null;
  relanceMonths: number | null;
  relanceEnabled: boolean;
  noShowCount?: number;
  createdAt: string;
  appointments?: Appointment[];
  messageLogs?: MessageLog[];
};

export type PaginatedPatients = {
  patients: Patient[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PatientStats = {
  total: number;
  withWhatsapp: number;
  noShows: number;
  newThisMonth: number;
};

export type Appointment = {
  id: string;
  cabinetId: string;
  patientId: string;
  patient?: Patient;
  practitionerId: string | null;
  practitioner?: Practitioner | null;
  scheduledAt: string;
  status: AppointmentStatus;
  careType: string | null;
  notes: string | null;
  source?: string;
  createdAt: string;
};

export type DashboardSummary = {
  todayCount: number;
  weekCount: number;
  noShowCount: number;
  rescheduleCount: number;
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
  whatsappProvider: "console" | "twilio" | "evolution";
};

export type CabinetSettings = {
  name: string;
  logoUrl: string | null;
  primaryColor: string | null;
  templateReminder48h: string | null;
  templateReminder24h: string | null;
  templateReminderCustom: string | null;
  templateRelance: string | null;
  reminder1MinBefore: number;
  reminder2MinBefore: number;
  reminder3MinBefore: number | null;
  reportDailyEnabled: boolean;
  reportWeeklyEnabled: boolean;
  reportMonthlyEnabled: boolean;
  reportEmail: string | null;
  aiRelanceEnabled: boolean;
  whatsappPhoneNumber: string | null;
  whatsappVerifiedAt: string | null;
};

export type Availability = {
  id: string;
  cabinetId: string;
  practitionerId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMin: number;
  createdAt: string;
};

export type Report = {
  id: string;
  cabinetId: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY";
  periodStart: string;
  periodEnd: string;
  data: string;
  sentAt: string | null;
  createdAt: string;
};

export type NotifPrefs = { notifPushEnabled: boolean; notifEmailEnabled: boolean };

// ─── API ─────────────────────────────────────────────────────────────────────

export const api = {
  // Auth
  registerCabinet: (input: { cabinetName: string; city?: string; fullName: string; email: string; password: string }) =>
    request<AuthResponse>("/api/auth/register-cabinet", { method: "POST", body: input }),

  login: (input: { email: string; password: string; rememberMe?: boolean }) =>
    request<AuthResponse | TwoFactorRequiredResponse>("/api/auth/login", { method: "POST", body: input }),

  verifyTwoFactor: (input: { challengeId: string; code: string; rememberMe?: boolean }) =>
    request<AuthResponse>("/api/auth/verify-2fa", { method: "POST", body: input }),

  toggleTwoFactor: (token: string, enabled: boolean) =>
    authed<{ user: SafeUser }>(token, "/api/auth/2fa", { method: "PATCH", body: { enabled } }),

  me: (token: string) =>
    request<{ user: SafeUser; cabinet: Cabinet | null }>("/api/auth/me", { token }),

  logout: (token: string) =>
    request<void>("/api/auth/logout", { method: "POST", token }),

  forgotPassword: (input: { email: string }) =>
    request<{ message: string }>("/api/auth/forgot-password", { method: "POST", body: input }),

  resetPassword: (input: { token: string; password: string }) =>
    request<{ message: string }>("/api/auth/reset-password", { method: "POST", body: input }),

  changePassword: (token: string, input: { currentPassword: string; newPassword: string }) =>
    authed<{ message: string }>(token, "/api/auth/change-password", { method: "POST", body: input }),

  updateProfile: (token: string, input: { fullName?: string; email?: string; avatarUrl?: string | null }) =>
    authed<{ user: SafeUser; cabinet: Cabinet | null }>(token, "/api/auth/me", { method: "PATCH", body: input }),

  // Dashboard
  dashboardSummary: (token: string, filters?: { year?: number; practitionerId?: string }) => {
    const qs = new URLSearchParams();
    if (filters?.year) qs.set("year", String(filters.year));
    if (filters?.practitionerId) qs.set("practitionerId", filters.practitionerId);
    const q = qs.toString();
    return authed<{ summary: DashboardSummary }>(token, `/api/dashboard/summary${q ? `?${q}` : ""}`);
  },

  // Patients
  listPatients: (
    token: string,
    params: {
      search?: string;
      noShowOnly?: boolean;
      whatsappOptIn?: boolean;
      year?: number;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortDir?: "asc" | "desc";
    } = {}
  ) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.noShowOnly) qs.set("noShowOnly", "true");
    if (params.whatsappOptIn !== undefined) qs.set("whatsappOptIn", String(params.whatsappOptIn));
    if (params.year) qs.set("year", String(params.year));
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params.sortBy) qs.set("sortBy", params.sortBy);
    if (params.sortDir) qs.set("sortDir", params.sortDir);
    const q = qs.toString();
    return authed<PaginatedPatients>(token, `/api/patients${q ? `?${q}` : ""}`);
  },

  getPatient: (token: string, id: string) =>
    authed<{ patient: Patient }>(token, `/api/patients/${id}`),

  getPatientStats: (token: string) =>
    authed<{ stats: PatientStats }>(token, "/api/patients/stats"),

  createPatient: (token: string, input: Partial<Patient>) =>
    authed<{ patient: Patient }>(token, "/api/patients", { method: "POST", body: input }),

  bulkCreatePatients: (token: string, patients: Partial<Patient>[]) =>
    authed<{ count: number }>(token, "/api/patients/bulk", { method: "POST", body: { patients } }),

  updatePatient: (token: string, id: string, input: Partial<Patient>) =>
    authed<{ patient: Patient }>(token, `/api/patients/${id}`, { method: "PATCH", body: input }),

  deletePatient: (token: string, id: string) =>
    authed<void>(token, `/api/patients/${id}`, { method: "DELETE" }),

  relancePatientNow: (token: string, id: string) =>
    authed<{ sent: boolean }>(token, `/api/relances/${id}/send`, { method: "POST" }),

  listRelances: (token: string) =>
    authed<{ relances: Relance[] }>(token, "/api/relances"),

  // Appointments
  listAppointments: (
    token: string,
    params: {
      range?: "today" | "week" | "all";
      status?: AppointmentStatus;
      practitionerId?: string;
      patientId?: string;
      dateFrom?: string;
      dateTo?: string;
      year?: number;
      page?: number;
      pageSize?: number;
    } = {}
  ) => {
    const qs = new URLSearchParams();
    if (params.range) qs.set("range", params.range);
    if (params.status) qs.set("status", params.status);
    if (params.practitionerId) qs.set("practitionerId", params.practitionerId);
    if (params.patientId) qs.set("patientId", params.patientId);
    if (params.dateFrom) qs.set("dateFrom", params.dateFrom);
    if (params.dateTo) qs.set("dateTo", params.dateTo);
    if (params.year) qs.set("year", String(params.year));
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    const q = qs.toString();
    return authed<{ appointments: Appointment[]; total: number }>(
      token,
      `/api/appointments${q ? `?${q}` : ""}`
    );
  },

  createAppointment: (token: string, input: Partial<Appointment>) =>
    authed<{ appointment: Appointment }>(token, "/api/appointments", { method: "POST", body: input }),

  updateAppointment: (token: string, id: string, input: Partial<Appointment>) =>
    authed<{ appointment: Appointment }>(token, `/api/appointments/${id}`, { method: "PATCH", body: input }),

  cancelAppointment: (token: string, id: string) =>
    authed<{ appointment: Appointment }>(token, `/api/appointments/${id}`, { method: "DELETE" }),

  // Settings
  getSettings: (token: string) =>
    authed<{ settings: CabinetSettings; aiAvailable: boolean }>(token, "/api/settings"),

  updateSettings: (token: string, input: Partial<CabinetSettings>) =>
    authed<{ settings: CabinetSettings }>(token, "/api/settings", { method: "PUT", body: input }),

  // Team
  listTeam: (token: string) => authed<{ members: TeamMember[] }>(token, "/api/team"),

  createTeamMember: (token: string, input: { fullName: string; email: string; password: string; role?: UserRole }) =>
    authed<{ member: TeamMember }>(token, "/api/team", { method: "POST", body: input }),

  updateTeamMember: (token: string, id: string, input: { fullName?: string; email?: string }) =>
    authed<{ member: TeamMember }>(token, `/api/team/${id}`, { method: "PATCH", body: input }),

  deleteTeamMember: (token: string, id: string) =>
    authed<void>(token, `/api/team/${id}`, { method: "DELETE" }),

  // Notifications
  listNotifications: (token: string, params: { page?: number; unreadOnly?: boolean } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.unreadOnly) qs.set("unreadOnly", "true");
    const q = qs.toString();
    return authed<PaginatedNotifications>(token, `/api/notifications${q ? `?${q}` : ""}`);
  },

  markNotificationRead: (token: string, id: string) =>
    authed<{ notification: Notification }>(token, `/api/notifications/${id}/read`, { method: "PATCH" }),

  markAllNotificationsRead: (token: string) =>
    authed<{ updated: number }>(token, "/api/notifications/read-all", { method: "PATCH" }),

  deleteNotification: (token: string, id: string) =>
    authed<void>(token, `/api/notifications/${id}`, { method: "DELETE" }),

  bulkDeleteNotifications: (token: string, ids: string[]) =>
    authed<{ deleted: number }>(token, "/api/notifications/bulk-delete", { method: "POST", body: { ids } }),

  deleteAllNotifications: (token: string) =>
    authed<{ deleted: number }>(token, "/api/notifications", { method: "DELETE" }),

  // Admin
  adminListCabinets: (token: string, params: { page?: number; status?: CabinetStatus; search?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.status) qs.set("status", params.status);
    if (params.search) qs.set("search", params.search);
    const q = qs.toString();
    return authed<PaginatedCabinets>(token, `/api/admin/cabinets${q ? `?${q}` : ""}`);
  },

  adminApproveCabinet: (token: string, id: string) =>
    authed<{ cabinet: Cabinet }>(token, `/api/admin/cabinets/${id}/approve`, { method: "POST" }),

  adminRejectCabinet: (token: string, id: string, reason?: string) =>
    authed<{ cabinet: Cabinet }>(token, `/api/admin/cabinets/${id}/reject`, { method: "POST", body: { reason } }),

  adminStats: (token: string) =>
    authed<{ stats: PlatformStats }>(token, "/api/admin/stats"),

  adminSetCabinetWhatsapp: (token: string, cabinetId: string, phoneNumber: string) =>
    authed<{ cabinet: Cabinet; waLink: string }>(
      token,
      `/api/admin/cabinets/${cabinetId}/whatsapp`,
      { method: "PATCH", body: { phoneNumber } }
    ),

  adminSendWhatsappCode: (token: string, cabinetId: string) =>
    authed<{ expiresAt: string }>(token, `/api/admin/cabinets/${cabinetId}/whatsapp/send-code`, {
      method: "POST",
    }),

  adminConfirmWhatsappCode: (token: string, cabinetId: string, code: string) =>
    authed<{ cabinet: Cabinet }>(token, `/api/admin/cabinets/${cabinetId}/whatsapp/confirm`, {
      method: "POST",
      body: { code },
    }),

  adminGetEvolutionQrCode: (token: string, cabinetId: string) =>
    authed<{ instanceName: string; qrCodeDataUrl: string | null }>(
      token,
      `/api/admin/cabinets/${cabinetId}/whatsapp/evolution-qr`
    ),

  adminCheckEvolutionConnection: (token: string, cabinetId: string) =>
    authed<{ state: "open" | "connecting" | "close" | "unknown"; cabinet: Cabinet }>(
      token,
      `/api/admin/cabinets/${cabinetId}/whatsapp/evolution-status`
    ),

  // Contact
  submitContactMessage: (input: { fullName: string; email: string; clinic?: string; phone?: string; subject?: string; message: string }) =>
    request<{ contact: unknown }>("/api/contact/messages", { method: "POST", body: input }),

  listContactMessages: (token: string, params: { page?: number; pageSize?: number; search?: string; sort?: "newest" | "oldest" } = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    if (params.search) qs.set("search", params.search);
    if (params.sort) qs.set("sort", params.sort);
    const q = qs.toString();
    return authed<{
      messages: Array<{ id: string; fullName: string; email: string; clinic?: string | null; phone?: string | null; subject?: string | null; message: string; createdAt: string }>;
      total: number; page: number; pageSize: number; totalPages: number;
    }>(token, `/api/contact/messages${q ? `?${q}` : ""}`);
  },

  // Practitioners
  listPractitioners: (token: string) =>
    authed<{ practitioners: Practitioner[] }>(token, "/api/practitioners"),

  createPractitioner: (token: string, input: { fullName: string }) =>
    authed<{ practitioner: Practitioner }>(token, "/api/practitioners", { method: "POST", body: input }),

  updatePractitioner: (token: string, id: string, input: { fullName: string }) =>
    authed<{ practitioner: Practitioner }>(token, `/api/practitioners/${id}`, { method: "PATCH", body: input }),

  deletePractitioner: (token: string, id: string) =>
    authed<void>(token, `/api/practitioners/${id}`, { method: "DELETE" }),

  // Public booking
  getPublicCabinetInfo: (cabinetId: string) =>
    request<{
      cabinet: {
        id: string;
        name: string;
        city: string | null;
        logoUrl?: string | null;
        primaryColor?: string | null;
        practitioners: { id: string; fullName: string }[];
      };
    }>(`/api/public/cabinets/${cabinetId}`),

  getPublicPatientInfo: (cabinetId: string, patientId: string) =>
    request<{ patient: { id: string; fullName: string; phoneNumber: string } }>(
      `/api/public/cabinets/${cabinetId}/patients/${patientId}`
    ),

  getPublicSlots: (cabinetId: string, date: string, practitionerId?: string) => {
    const qs = new URLSearchParams({ date });
    if (practitionerId) qs.set("practitionerId", practitionerId);
    return request<{ slots: Array<{ time: string; available: boolean }> }>(
      `/api/public/cabinets/${cabinetId}/slots?${qs}`
    );
  },

  requestPublicAppointment: (cabinetId: string, input: { fullName: string; phoneNumber: string; scheduledAt: string; practitionerId?: string; careType?: string; notes?: string; patientId?: string; whatsappOptIn?: boolean }) =>
    request<{ appointment: Appointment }>(`/api/public/cabinets/${cabinetId}/book`, { method: "POST", body: input }),

  // Push
  getVapidPublicKey: () =>
    request<{ publicKey: string | null }>("/api/push/vapid-public-key"),

  subscribePush: (token: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
    authed<{ subscribed: boolean }>(token, "/api/push/subscribe", { method: "POST", body: subscription }),

  unsubscribePush: (token: string, endpoint: string) =>
    authed<void>(token, "/api/push/unsubscribe", { method: "POST", body: { endpoint } }),

  getNotifPrefs: (token: string) =>
    authed<{ prefs: NotifPrefs }>(token, "/api/push/prefs"),

  updateNotifPrefs: (token: string, prefs: Partial<NotifPrefs>) =>
    authed<{ prefs: NotifPrefs }>(token, "/api/push/prefs", { method: "PATCH", body: prefs }),

  // Disponibilités
  listAvailabilities: (token: string, practitionerId?: string) => {
    const qs = practitionerId ? `?practitionerId=${practitionerId}` : "";
    return authed<{ availabilities: Availability[] }>(token, `/api/availability${qs}`);
  },

  createAvailability: (token: string, input: Omit<Availability, "id" | "createdAt">) =>
    authed<{ availability: Availability }>(token, "/api/availability", { method: "POST", body: input }),

  deleteAvailability: (token: string, id: string) =>
    authed<void>(token, `/api/availability/${id}`, { method: "DELETE" }),

  // Rapports
  listReports: (token: string, params: { period?: string; page?: number; pageSize?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.period) qs.set("period", params.period);
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    const q = qs.toString();
    return authed<{ reports: Report[]; total: number; page: number; totalPages: number }>(
      token,
      `/api/reports${q ? `?${q}` : ""}`
    );
  },

  generateReport: (token: string, period: "DAILY" | "WEEKLY" | "MONTHLY") =>
    authed<{ data: Record<string, unknown> }>(token, "/api/reports/generate", { method: "POST", body: { period } }),

  // Newsletter
  subscribeNewsletter: (email: string) =>
    request<{ message: string }>("/api/newsletter/subscribe", { method: "POST", body: { email } }),

  unsubscribeNewsletter: (email: string) =>
    request<{ message: string }>("/api/newsletter/unsubscribe", { method: "POST", body: { email } }),

  // Avis publics (témoignages)
  listTestimonials: () =>
    request<{ testimonials: Testimonial[] }>("/api/testimonials"),

  submitTestimonial: (input: { authorName: string; authorRole?: string; rating?: number; message: string }) =>
    request<{ testimonial: Testimonial }>("/api/testimonials", { method: "POST", body: input }),

  likeTestimonial: (id: string) =>
    request<{ testimonial: Testimonial }>(`/api/testimonials/${id}/like`, { method: "POST" }),

  dislikeTestimonial: (id: string) =>
    request<{ testimonial: Testimonial }>(`/api/testimonials/${id}/dislike`, { method: "POST" }),

  adminListTestimonials: (token: string) =>
    authed<{ testimonials: Testimonial[] }>(token, "/api/admin/testimonials"),

  adminSetTestimonialVisibility: (token: string, id: string, visible: boolean) =>
    authed<{ testimonial: Testimonial }>(token, `/api/admin/testimonials/${id}`, { method: "PATCH", body: { visible } }),

  adminDeleteTestimonial: (token: string, id: string) =>
    authed<void>(token, `/api/admin/testimonials/${id}`, { method: "DELETE" }),
};
