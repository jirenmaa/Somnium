export const publicMatchers: readonly RegExp[] = [
  /^\/$/,
  /^\/videos$/,
  /^\/videos\/[^/]+$/,
  /^\/profile\/[^/]+$/,
] as const;

export const authRoutes: string[] = ["/sign-in", "/sign-up"];

export const apiAuthPrefix: string = "/api/auth";

export const DEFAULT_LOGIN_REDIRECT: string = "/";
