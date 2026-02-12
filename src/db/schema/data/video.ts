import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";

import { user } from "../auth/user";

export const video = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom().unique(), // postgres id
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  videoId: text("video_id").notNull(), // imagekit video id
  thumbnailUrl: text("thumbnail_url").notNull(),
  thumbnailId: text("thumbnail_id").notNull(), // imagekit thumb id
  visibility: text("visibility")
    .$type<"public" | "private" | "unlisted">()
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  views: integer("views").notNull().default(0),
  duration: integer("duration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type VideoType = typeof video.$inferSelect;
