import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserIdentity(identity: AuthSession): Identity | null {
  if (!identity) return null;

  return {
    id: identity.user.id,
    email: identity.user.email,
    verified: identity.user.emailVerified,
    avatarUrl: identity.user.image || null,
    fullName: identity.user.name,
    displayName: identity.user.username || identity.user.name,
    lastSignIn: identity.session.createdAt,
  };
}

/**
 * Custom error class for server actions with additional metadata
 */
export class ActionError extends Error {
  statusCode: number;
  type: PageErrorType;

  constructor(message: string, type: PageErrorType = "server", status = 500) {
    super(message);
    this.name = "ActionError";
    this.statusCode = status;
    this.type = type;
  }
}

/**
 * Throws a new ActionError with metadata
 * @param message Error message
 * @param errType Error type
 * @param status HTTP status code
 */
export const ThrowNewError = (
  message: string,
  errType: PageErrorType = "server",
  status = 500,
): never => {
  throw new ActionError(message, errType, status);
};

/**
 * Logger utility for server-side logging
 * Provides structured logging for security and debugging
 */
export const logger = {
  debug: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEBUG] ${message}`, context || "");
    }
  },

  info: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[INFO] ${message}`, context || "");
    }
  },

  warn: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[WARN] ${message}`, context || "");
    }
  },

  error: (message: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.error(`[ERROR] ${message}`, context || "");
    }
  },

  /**
   * Log security-related events
   */
  security: (event: string, context?: Record<string, any>) => {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[SECURITY] ${event}`, context || "");
    }
  },
};

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export function daysAgo(inputDate: Date): string {
  const input = new Date(inputDate);
  const now = new Date();

  const diffTime = now.getTime() - input.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "1 day ago";
  } else {
    return `${diffDays} days ago`;
  }
}

export function formatDate(date: Date | string) {
  const d = new Date(date);

  // prettier-ignore
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const month = months[d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const year = d.getUTCFullYear();

  return `${month} ${day}, ${year}`;
}
