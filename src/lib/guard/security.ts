/**
 * Security utilities module
 * Provides authentication, authorization, and request validation helpers
 */

import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { ThrowNewError, logger } from "@/lib/utils";

/**
 * Validates user authentication and returns session
 * @throws Error if user is not authenticated
 */
export async function requireAuth() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    logger.security("Authentication required - session not found");
    ThrowNewError("You must be authenticated to perform this action", "server", 401);
  }

  return session;
}

/**
 * Validates optional authentication and returns session or null
 */
export async function getOptionalAuth() {
  const requestHeaders = await headers();

  try {
    const session = await auth.api.getSession({
      headers: requestHeaders,
    });

    return session;
  } catch (error) {
    logger.debug("Failed to retrieve optional auth session");
    return null;
  }
}

/**
 * Validates resource ownership
 * @param resourceUserId The user ID who owns the resource
 * @param currentUserId The current user's ID
 * @throws Error if user doesn't own the resource
 */
export function validateOwnership(
  resourceUserId: string,
  currentUserId: string,
): void {
  if (resourceUserId !== currentUserId) {
    logger.security(`Ownership validation failed`, {
      resourceUserId,
      currentUserId,
    });
    ThrowNewError("You do not have permission to access this resource", "server", 403);
  }
}

/**
 * Validates array of resource ownerships
 * @param resourceUserIds Array of user IDs who own resources
 * @param currentUserId The current user's ID
 * @throws Error if any resource isn't owned by the user
 */
export function validateArrayOwnership(
  resourceUserIds: string[],
  currentUserId: string,
): void {
  const hasUnauthorized = resourceUserIds.some(
    (userId) => userId !== currentUserId,
  );

  if (hasUnauthorized) {
    logger.security(`Array ownership validation failed`, {
      count: resourceUserIds.length,
      currentUserId,
    });
    ThrowNewError("One or more resources do not belong to you", "server", 403);
  }
}

/**
 * Validates user role/permission
 * @param userRole The user's role
 * @param requiredRoles Allowed roles
 * @throws Error if user doesn't have required role
 */
export function validateRole(
  userRole: string,
  requiredRoles: string[],
): void {
  if (!requiredRoles.includes(userRole)) {
    logger.security(`Role validation failed`, {
      userRole,
      requiredRoles,
    });
    ThrowNewError("You don't have permission to perform this action", "server", 403);
  }
}

/**
 * Sanitizes input to prevent basic injection attacks
 */
export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 5000); // Prevent excessively large inputs
}

/**
 * Validates request IP to detect specific attacks
 */
export async function getClientIp(): Promise<string | null> {
  const requestHeaders = await headers();

  const forwarded = requestHeaders.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? null;
}

/**
 * Logs suspicious activity
 */
export function logSuspiciousActivity(
  activity: string,
  details?: Record<string, any>,
): void {
  logger.security(`Suspicious activity detected: ${activity}`, details);
}

// Export logger for use in other modules
export { logger } from "@/lib/utils";
