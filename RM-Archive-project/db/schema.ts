import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedUrl: text("related_url"),
  email: text("email"),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
}, (table) => [index("idx_feedback_created_at").on(table.createdAt)]);

export const birthdayWishes = sqliteTable("birthday_wishes", {
  id: text("id").primaryKey(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
}, (table) => [index("idx_birthday_wishes_created_at").on(table.createdAt)]);
