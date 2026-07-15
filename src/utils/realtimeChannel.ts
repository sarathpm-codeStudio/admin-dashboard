// Unique realtime topic per subscription. supabase-js (≥ ~2.107) returns the
// EXISTING channel instance when a topic name is reused, and postgres_changes
// callbacks cannot be added to a channel that has already subscribed. React
// StrictMode remounts effects synchronously while removeChannel() is still
// tearing the old channel down asynchronously, so any fixed topic name crashes
// on the second mount ("cannot add `postgres_changes` callbacks … after
// `subscribe()`"). The topic name carries no meaning for postgres_changes
// subscriptions, so a unique suffix is free. Do NOT use this for broadcast
// channels (e.g. typing) — those need both peers on the same topic.
let seq = 0
export const uniqueChannel = (base: string): string => `${base}-${++seq}`
