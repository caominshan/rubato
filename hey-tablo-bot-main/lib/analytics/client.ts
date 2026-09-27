import { productEventsSchema, type ProductEvent, type ProductEventInput, type ProductEventName } from "./schema";

export const ANALYTICS_STORAGE_KEY = "hey-tablo-product-events-v1";
const MAX_STORED_EVENTS = 500;

export function readLiveEvents(): ProductEvent[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = productEventsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.filter((event) => event.source === "live") : [];
  } catch {
    return [];
  }
}

export function trackProductEvent(name: ProductEventName, input: ProductEventInput = {}): ProductEvent | null {
  if (typeof window === "undefined") return null;

  const event: ProductEvent = {
    id: globalThis.crypto?.randomUUID?.() ?? `event_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    name,
    occurredAt: new Date().toISOString(),
    source: "live",
    ...input,
  };
  const parsed = productEventsSchema.element.safeParse(event);
  if (!parsed.success) return null;

  const nextEvents = [...readLiveEvents(), parsed.data].slice(-MAX_STORED_EVENTS);
  window.localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(nextEvents));
  window.dispatchEvent(new CustomEvent("hey-tablo:analytics-updated"));
  return parsed.data;
}

export function clearLiveEvents() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ANALYTICS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("hey-tablo:analytics-updated"));
}
