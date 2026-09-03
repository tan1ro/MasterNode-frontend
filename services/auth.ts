import { apiClient } from "@/lib/api-client"

export type AccountType = "creator" | "business"
export type AccountPlan =
  | "free"
  | "pro"
  | "pro_plus"
  | "premium"
  | "enterprise"
export type AccountDeleteMode = "soft" | "permanent"

export interface AuthProfileResponse {
  tenant_id: string
  email?: string
  /** Account username from app_users (sidebar / profile). */
  username?: string | null
  /** True when the account has a password hash (email/password sign-in). */
  has_password?: boolean
  is_superuser?: boolean
  auth_source: "app" | "api_key" | string
  account_type: AccountType
  available_account_types: AccountType[]
  plan: AccountPlan
  available_plans: AccountPlan[]
  account_status?: "active" | "soft_deleted" | string
  purge_at?: string | null
  org_id?: string
  org_name?: string
  org_role?: string
  org_logo_data_url?: string
  onboarding_completed?: boolean
  onboarding?: {
    role?: string
    role_other?: string
    build_goal?: string
    attribution?: string
    attribution_other?: string
    work_context?: string
    work_context_skipped?: boolean
    use_case_summary?: string
    knowledge_file_ids?: string[]
    legal_consents?: Record<string, string>
    skipped?: boolean
    completed_at?: string
  }
  chat_intro_completed?: boolean
  chat_intro_completed_at?: string
  last_login_at?: string
  totp_enabled?: boolean
  oauth_providers?: Array<{ provider: string; linked_at?: string }>
}

export interface DeleteAccountResponse {
  ok: boolean
  mode: AccountDeleteMode
  tenant_id: string
  auth_source: "app" | "api_key" | string
  message: string
  account_status?: "soft_deleted" | string
  purge_at?: string | null
}

export interface AdminUserRow {
  tenant_id: string
  email: string
  username: string
  account_type: AccountType
  plan: AccountPlan
  created_at?: string
  updated_at?: string
}

export interface AdminUsersListResponse {
  users: AdminUserRow[]
  count: number
  total: number
}

export interface AuthTokenResponse {
  tenant_id: string
  email?: string
  access_token: string
  refresh_token?: string
  token_type: string
  /** Access JWT lifetime in seconds (default 3600). */
  expires_in?: number
}

export interface EmailAvailabilityResponse {
  exists: boolean
  available: boolean
}

export interface AuthSessionRow {
  jti: string
  device_label: string
  ip: string
  user_agent?: string
  created_at?: string
  updated_at?: string
  expires_at?: string
  current?: boolean
}

export interface AuthLoginHistoryRow {
  id?: string
  ts?: string
  outcome?: string
  method?: string
  ip?: string
  device_label?: string
}

export interface AuthTotpSetupResponse {
  secret: string
  otpauth_uri: string
}

export interface AuthTotpStatusResponse {
  enabled: boolean
  pending_setup?: boolean
}

export const authService = {
  checkEmail: (email: string): Promise<EmailAvailabilityResponse> =>
    apiClient
      .get<EmailAvailabilityResponse>("/v1/auth/check-email", { params: { email } })
      .then((res) => res.data),

  login: (email: string, password: string, totpCode?: string): Promise<AuthTokenResponse> =>
    apiClient
      .post<AuthTokenResponse>("/v1/auth/login", {
        email,
        password,
        ...(totpCode?.trim() ? { totp_code: totpCode.trim() } : {}),
      })
      .then((res) => res.data),

  refresh: (refreshToken: string): Promise<AuthTokenResponse> =>
    apiClient
      .post<AuthTokenResponse>("/v1/auth/refresh", { refresh_token: refreshToken })
      .then((res) => res.data),

  register: (payload: {
    email: string
    password: string
    username?: string
    account_type?: AccountType
    plan?: AccountPlan
  }): Promise<AuthTokenResponse> =>
    apiClient.post<AuthTokenResponse>("/v1/auth/register", payload).then((res) => res.data),

  logout: (refreshToken?: string): Promise<{ ok: boolean }> =>
    apiClient.post<{ ok: boolean }>("/v1/auth/logout", { refresh_token: refreshToken }).then((res) => res.data),

  me: (): Promise<AuthProfileResponse> =>
    apiClient.get<AuthProfileResponse>("/v1/auth/me").then((res) => res.data),

  saveOnboarding: (payload: {
    role?: string
    role_other?: string
    build_goal?: string
    attribution?: string
    attribution_other?: string
    work_context?: string
    work_context_skipped?: boolean
    use_case_summary?: string
    knowledge_file_ids?: string[]
    legal_consents?: Record<string, string>
    skipped?: boolean
    completed_at?: string
  }): Promise<{ ok: boolean }> =>
    apiClient.patch<{ ok: boolean }>("/v1/auth/onboarding", payload).then((res) => res.data),

  saveChatIntro: (payload: { completed_at?: string }): Promise<{ ok: boolean }> =>
    apiClient.patch<{ ok: boolean }>("/v1/auth/chat-intro", payload).then((res) => res.data),

  changePassword: (currentPassword: string, newPassword: string): Promise<{ ok: boolean }> =>
    apiClient
      .patch<{ ok: boolean }>("/v1/auth/password", {
        current_password: currentPassword,
        new_password: newPassword,
      })
      .then((res) => res.data),

  listSessions: (refreshToken?: string | null): Promise<{ sessions: AuthSessionRow[]; count: number }> =>
    apiClient
      .get<{ sessions: AuthSessionRow[]; count: number }>("/v1/auth/sessions", {
        params: refreshToken?.trim() ? { refresh_token: refreshToken.trim() } : undefined,
      })
      .then((res) => res.data),

  revokeSession: (sessionJti: string): Promise<{ ok: boolean }> =>
    apiClient
      .delete<{ ok: boolean }>(`/v1/auth/sessions/${encodeURIComponent(sessionJti)}`)
      .then((res) => res.data),

  revokeOtherSessions: (refreshToken?: string | null): Promise<{ ok: boolean; revoked_count: number }> =>
    apiClient
      .post<{ ok: boolean; revoked_count: number }>("/v1/auth/sessions/revoke-others", {
        refresh_token: refreshToken?.trim() || undefined,
      })
      .then((res) => res.data),

  loginHistory: (limit = 25): Promise<{ events: AuthLoginHistoryRow[]; count: number }> =>
    apiClient
      .get<{ events: AuthLoginHistoryRow[]; count: number }>("/v1/auth/login-history", {
        params: { limit },
      })
      .then((res) => res.data),

  totpStatus: (): Promise<AuthTotpStatusResponse> =>
    apiClient.get<AuthTotpStatusResponse>("/v1/auth/2fa/status").then((res) => res.data),

  totpSetup: (): Promise<AuthTotpSetupResponse> =>
    apiClient.post<AuthTotpSetupResponse>("/v1/auth/2fa/setup", {}).then((res) => res.data),

  totpEnable: (code: string): Promise<{ ok: boolean; enabled: boolean }> =>
    apiClient
      .post<{ ok: boolean; enabled: boolean }>("/v1/auth/2fa/enable", { code })
      .then((res) => res.data),

  totpDisable: (code: string): Promise<{ ok: boolean; enabled: boolean }> =>
    apiClient
      .post<{ ok: boolean; enabled: boolean }>("/v1/auth/2fa/disable", { code })
      .then((res) => res.data),

  updateProfile: (account_type: AccountType, plan: AccountPlan): Promise<AuthProfileResponse> =>
    apiClient.put<AuthProfileResponse>("/v1/auth/role", { account_type, plan }).then((res) => res.data),

  deleteAccount: (mode: AccountDeleteMode): Promise<DeleteAccountResponse> =>
    apiClient
      .post<DeleteAccountResponse>("/v1/auth/delete", {
        mode,
      })
      .then((res) => res.data),

  adminListUsers: (params?: {
    limit?: number
    skip?: number
    q?: string
  }): Promise<AdminUsersListResponse> =>
    apiClient
      .get<AdminUsersListResponse>("/v1/admin/users", {
        params: {
          limit: params?.limit ?? 50,
          skip: params?.skip ?? 0,
          ...(params?.q?.trim() ? { q: params.q.trim() } : {}),
        },
      })
      .then((res) => res.data),

  /** Create a workspace user with password (superuser JWT required). */
  adminCreateUser: (payload: {
    email: string
    password?: string
    generate_password?: boolean
    username?: string
    account_type: AccountType
    plan: AccountPlan
  }): Promise<{
    ok: boolean
    user: AdminUserRow
    credentials: { email: string; password: string }
  }> =>
    apiClient
      .post<{
        ok: boolean
        user: AdminUserRow
        credentials: { email: string; password: string }
      }>("/v1/admin/users", payload)
      .then((res) => res.data),

  /** Permanently delete a workspace user (superuser JWT required). */
  adminDeleteUser: (tenantId: string): Promise<{ ok: boolean; tenant_id: string }> =>
    apiClient
      .delete<{ ok: boolean; tenant_id: string }>(
        `/v1/admin/users/${encodeURIComponent(tenantId)}`
      )
      .then((res) => res.data),

  /** Update account_type/plan for another workspace user (superuser only). */
  adminUpdateUserAccess: (
    tenantId: string,
    account_type: AccountType,
    plan: AccountPlan
  ): Promise<{ ok: boolean; tenant_id: string; account_type: AccountType; plan: AccountPlan }> =>
    apiClient
      .put<{ ok: boolean; tenant_id: string; account_type: AccountType; plan: AccountPlan }>(
        `/v1/admin/users/${encodeURIComponent(tenantId)}/access`,
        { account_type, plan }
      )
      .then((res) => res.data),
}

