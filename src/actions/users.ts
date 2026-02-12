"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema";
import { withAction } from "@/lib/guard/rate-limit";
import {
  requireAuth,
  validateOwnership,
  logger as securityLogger,
} from "@/lib/guard/security";
import { ThrowNewError } from "@/lib/utils";


/**
 * Retrieves a public user profile by ID
 * Public action - no authentication required
 * @param userId The user ID to fetch
 * @returns User profile object
 */
export const getUser = withAction(
  async (userId: string) => {
    if (!userId || userId.trim().length === 0) {
      ThrowNewError("Valid user ID is required", "server", 400);
    }

    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        displayUsername: user.displayUsername,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    const userData = rows[0];

    if (!userData) {
      ThrowNewError("User not found", "notFound", 404);
    }

    return userData;
  },
  { requireAuth: false, name: "getUser" },
);

/**
 * Retrieves the current authenticated user's full profile
 * @returns Current user's complete profile
 */
export const getMe = withAction(
  async () => {
    const session = await requireAuth();

    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        displayUsername: user.displayUsername,
        image: user.image,
        email: user.email,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, session!.user.id))
      .limit(1);

    const userData = rows[0];

    if (!userData) {
      securityLogger.warn(`User data not found in database for authenticated user`, {
        userId: session!.user.id,
      });
      ThrowNewError("User profile not found", "notFound", 404);
    }

    return userData;
  },
  { name: "getMe" },
);

/**
 * Updates the authenticated user's profile
 * @param userId User ID being updated
 * @param updates Profile fields to update
 * @returns Updated user object
 */
export const updateProfile = withAction(
  async (userId: string, updates: Partial<{ name: string; image: string }>) => {
    const session = await requireAuth();

    // Ensure user can only update their own profile
    validateOwnership(userId, session!.user.id);

    if (!updates.name && !updates.image) {
      ThrowNewError("No updates provided", "server", 400);
    }

    // Validate input lengths
    if (updates.name && (updates.name.length < 2 || updates.name.length > 100)) {
      ThrowNewError("Name must be between 2 and 100 characters", "server", 400);
    }

    const updateData: Record<string, any> = {};
    if (updates.name) {
      updateData.name = updates.name.trim();
    }
    if (updates.image) {
      updateData.image = updates.image;
    }

    const [updated] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, userId))
      .returning();

    securityLogger.info(`User profile updated`, {
      userId,
      fields: Object.keys(updates),
    });

    return updated;
  },
  { name: "updateProfile" },
);
