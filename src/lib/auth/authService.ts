// src/lib/auth/authService.ts

import { api } from "@/logaxp/lib/api/apiClient";
import type {
  AcceptInviteInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  MeResponse,
  RegisterInput,
  ResendVerifyEmailInput,
  ResendVerifyEmailWithPasswordInput,
  ResetPasswordInput,
  SignupTenantInput,
  SignupTenantResponse,
  VerifyEmailInput,
  RefreshResponse,
} from "./auth.types";

export const authService = {
  async register(input: RegisterInput) {
    const { data } = await api.post("/auth/register", input);
    return data;
  },

  async signupTenant(input: SignupTenantInput): Promise<SignupTenantResponse> {
    const { data } = await api.post<SignupTenantResponse>("/auth/signup", input);
    return data;
  },

  async login(input: LoginInput): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", input);
    return data;
  },

  async refresh(): Promise<RefreshResponse> {
    const { data } = await api.post<RefreshResponse>("/auth/refresh");
    return data;
  },

  async me(): Promise<MeResponse> {
    const { data } = await api.get<MeResponse>("/auth/me");
    return data;
  },

  async logout() {
    const { data } = await api.post("/auth/logout");
    return data;
  },

  async verifyEmail(input: VerifyEmailInput) {
    const { data } = await api.post("/auth/email/verify", input);
    return data;
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const { data } = await api.post("/auth/password/forgot", input);
    return data;
  },

  async resetPassword(input: ResetPasswordInput) {
    const { data } = await api.post("/auth/password/reset", input);
    return data;
  },

  async changePassword(input: ChangePasswordInput) {
    const { data } = await api.post("/auth/password/change", input);
    return data;
  },

  async acceptInvitation(input: AcceptInviteInput) {
    const { data } = await api.post("/auth/invitations/accept", input);
    return data;
  },

  async resendVerifyEmail(input: ResendVerifyEmailInput) {
    const { data } = await api.post("/auth/email/resend", input);
    return data;
  },

  async resendVerifyEmailWithPassword(input: ResendVerifyEmailWithPasswordInput) {
    const { data } = await api.post("/auth/email/resend-with-password", input);
    return data;
  },
};
