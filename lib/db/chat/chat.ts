import { and, desc, eq, inArray, isNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { chatMessages, chatSessions } from "@/lib/db/schema/schema";
import type { ChatMessage, ChatSession } from "@/types/domain";
import { storeEmbeddingFireAndForget } from "@/lib/ai/embeddings/store";

function toSession(row: typeof chatSessions.$inferSelect): ChatSession {
  return {
    id: row.id,
    userId: row.userId,
    patientId: row.patientId,
    title: row.title,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toMessage(row: typeof chatMessages.$inferSelect): ChatMessage {
  return {
    id: row.id,
    sessionId: row.sessionId,
    role: row.role as "user" | "assistant",
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createSession(userId: string, patientId: string | null) {
  const [row] = await db
    .insert(chatSessions)
    .values({ userId, patientId })
    .returning();

  return toSession(row);
}

export async function getSessionById(sessionId: string) {
  const [row] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .limit(1);

  return row ? toSession(row) : null;
}

export async function listGlobalSessions(userId: string, max = 50) {
  const rows = await db
    .select()
    .from(chatSessions)
    .where(and(eq(chatSessions.userId, userId), isNull(chatSessions.patientId)))
    .orderBy(desc(chatSessions.updatedAt))
    .limit(max);

  return rows.map(toSession);
}

export async function getPatientSession(patientId: string) {
  const [row] = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.patientId, patientId))
    .limit(1);

  return row ? toSession(row) : null;
}

export async function renameSession(sessionId: string, title: string) {
  await db
    .update(chatSessions)
    .set({ title })
    .where(eq(chatSessions.id, sessionId));
}

export async function getSessionMessages(
  sessionId: string,
  offset = 0,
  limit = 30,
) {
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(desc(chatMessages.createdAt))
    .offset(offset)
    .limit(limit + 1);

  // Return rows in ASC order (oldest first) for the UI
  // The extra row tells the caller if there are more older messages
  const hasMore = rows.length > limit;
  if (hasMore) rows.pop();

  return {
    messages: rows.map(toMessage).reverse(),
    hasMore,
  };
}

export async function getSessionMessageCount(sessionId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId));

  return Number(row?.count ?? 0);
}

export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string,
) {
  const [row] = await db
    .insert(chatMessages)
    .values({ sessionId, role, content })
    .returning();

  const session = await getSessionById(sessionId);
  if (session?.patientId) {
    storeEmbeddingFireAndForget(session.patientId, "chat_message", row.id, content);
  }

  return toMessage(row);
}

export async function touchSession(sessionId: string) {
  await db
    .update(chatSessions)
    .set({ updatedAt: new Date() })
    .where(eq(chatSessions.id, sessionId));
}

export async function deleteSession(sessionId: string) {
  await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));
}

export async function deleteSessions(sessionIds: string[]) {
  if (sessionIds.length === 0) return;
  await db.delete(chatSessions).where(inArray(chatSessions.id, sessionIds));
}

export async function getPatientChatData(patientId: string, userId: string) {
  let session = await getPatientSession(patientId);

  if (!session) {
    session = await createSession(userId, patientId);
  }

  const { messages, hasMore } = await getSessionMessages(session.id);
  return { session, messages, hasMore };
}
