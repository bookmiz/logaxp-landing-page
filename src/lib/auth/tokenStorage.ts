// src/lib/auth/tokenStorage.ts
"use client";

const ACCESS = "logaxp_access";
const REFRESH = "logaxp_refresh";

const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";

function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
}

function setBrowserCookie(name: string, value: string, maxAge: number) {
  if (typeof document === "undefined") return;

  const secure = isProd ? "; Secure" : "";
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function deleteBrowserCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${encodeURIComponent(name)}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export const tokenStorage = {
  getAccessToken(): string | null {
    return getCookieValue(ACCESS);
  },

  getRefreshToken(): string | null {
    return getCookieValue(REFRESH);
  },

  setTokens(accessToken: string, refreshToken?: string) {
    setBrowserCookie(ACCESS, accessToken, 60 * 60);

    if (refreshToken) {
      setBrowserCookie(REFRESH, refreshToken, 60 * 60 * 24 * 30);
    }
  },

  clear() {
    deleteBrowserCookie(ACCESS);
    deleteBrowserCookie(REFRESH);
  },
};
