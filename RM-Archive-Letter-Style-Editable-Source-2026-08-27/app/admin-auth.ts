import { env } from "cloudflare:workers";
import { getChatGPTUser, requireChatGPTUser } from "./chatgpt-auth";

export async function requireAdmin(returnTo = "/admin") {
  const user = await requireChatGPTUser(returnTo);
  if (!env.ADMIN_USER_ID || user.userId !== env.ADMIN_USER_ID) return null;
  return user;
}

export async function isAdmin() {
  const user = await getChatGPTUser();
  return Boolean(user && env.ADMIN_USER_ID && user.userId === env.ADMIN_USER_ID);
}
