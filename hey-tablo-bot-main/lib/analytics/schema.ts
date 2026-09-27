import { z } from "zod";
import { agentFeedbackSchema } from "@/lib/agent/output";

export const productEventNameSchema = z.enum([
  "query_submitted",
  "recommendation_shown",
  "segment_selected",
  "source_opened",
  "feedback_clicked",
  "recommendation_replanned",
  "memory_saved",
  "translation_corrected",
]);

export const productEventSchema = z.object({
  id: z.string().min(1),
  name: productEventNameSchema,
  occurredAt: z.string().datetime(),
  conversationId: z.string().min(1).optional(),
  turn: z.number().int().positive().optional(),
  segmentId: z.string().min(1).optional(),
  episode: z.number().int().positive().optional(),
  feedback: agentFeedbackSchema.optional(),
  recommendationCount: z.number().int().min(0).max(10).optional(),
  source: z.enum(["live", "demo"]),
});

export const productEventsSchema = z.array(productEventSchema);

export type ProductEventName = z.infer<typeof productEventNameSchema>;
export type ProductEvent = z.infer<typeof productEventSchema>;
export type ProductEventInput = Omit<ProductEvent, "id" | "name" | "occurredAt" | "source">;
