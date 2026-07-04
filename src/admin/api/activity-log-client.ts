import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface ActivityEntry {
  id: string;
  userId: string | null;
  actorEmail: string | null;
  action: string;
  entity: string | null;
  entityId: string | null;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface LogInput {
  action: string;
  entity?: string;
  entityId?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

/** Append one row to the activity log. Fire-and-forget: never throws. */
export async function logActivity(input: LogInput): Promise<void> {
  try {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    await supabase.from("activity_log").insert({
      user_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      action: input.action,
      entity: input.entity ?? null,
      entity_id: input.entityId ?? null,
      message: input.message ?? "",
      metadata: (input.metadata ?? {}) as Json,
    });
  } catch {
    // ignore — logging must never break the calling flow
  }
}

export interface ListActivityOptions {
  entity?: string;
  entityId?: string;
  limit?: number;
}

export async function listActivity(opts: ListActivityOptions = {}): Promise<ActivityEntry[]> {
  let q = supabase
    .from("activity_log")
    .select("id,user_id,actor_email,action,entity,entity_id,message,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(opts.limit ?? 200);
  if (opts.entity) q = q.eq("entity", opts.entity);
  if (opts.entityId) q = q.eq("entity_id", opts.entityId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    id: r.id,
    userId: r.user_id,
    actorEmail: r.actor_email,
    action: r.action,
    entity: r.entity,
    entityId: r.entity_id,
    message: r.message,
    metadata: (r.metadata as Record<string, unknown>) ?? {},
    createdAt: r.created_at,
  }));
}
