import type { TierLabel } from './data';

export const COMMUNITY_STORAGE_KEY = 'taskbarhero-copy:community:v1';
const MAX_STATE_BYTES = 64_000;
const HERO_SLUGS = new Set(['knight', 'ranger', 'sorcerer', 'priest', 'hunter', 'slayer']);

export type LocalProvider = 'google' | 'discord';
export type VoteDirection = -1 | 1;

export interface LocalProfile { provider: LocalProvider; displayName: string }
export interface GuideDraft { id: string; title: string; summary: string; body: string; createdAt: string }
export interface BuildDraft { id: string; sourceId: string; title: string; createdAt: string }
export interface TierDraft { id: string; title: string; description: string; tiers: Record<TierLabel, string[]>; createdAt: string }

export interface CommunityState {
  version: 1;
  profile: LocalProfile | null;
  drafts: { guides: GuideDraft[]; builds: BuildDraft[]; tierLists: TierDraft[] };
  votes: Record<string, VoteDirection>;
}

const now = () => new Date().toISOString();
const plainObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
const safeText = (value: unknown, max: number): string | null => typeof value === 'string' && value.trim() && value.trim().length <= max ? value.trim() : null;
const safeKey = (value: string) => /^(guide|build|tier):[a-z0-9][a-z0-9-]{0,79}$/i.test(value);

export function createEmptyCommunityState(): CommunityState {
  return { version: 1, profile: null, drafts: { guides: [], builds: [], tierLists: [] }, votes: {} };
}

function sanitizeProfile(value: unknown): LocalProfile | null {
  if (!plainObject(value) || (value.provider !== 'google' && value.provider !== 'discord')) return null;
  const displayName = safeText(value.displayName, 80);
  return displayName ? { provider: value.provider, displayName } : null;
}

export function parseCommunityState(raw: string | null): CommunityState {
  if (!raw || raw.length > MAX_STATE_BYTES) return createEmptyCommunityState();
  try {
    const value = JSON.parse(raw) as unknown;
    if (!plainObject(value) || value.version !== 1) return createEmptyCommunityState();
    const state = createEmptyCommunityState();
    state.profile = sanitizeProfile(value.profile);
    if (plainObject(value.votes)) {
      for (const [key, direction] of Object.entries(value.votes)) {
        if (safeKey(key) && (direction === 1 || direction === -1)) state.votes[key] = direction;
      }
    }
    const drafts = plainObject(value.drafts) ? value.drafts : {};
    if (Array.isArray(drafts.guides)) {
      state.drafts.guides = drafts.guides.slice(0, 20).flatMap((entry) => {
        if (!plainObject(entry)) return [];
        const id = safeText(entry.id, 80), title = safeText(entry.title, 80), summary = safeText(entry.summary, 220), body = safeText(entry.body, 5_000), createdAt = safeText(entry.createdAt, 40);
        return id && title && summary && body && createdAt ? [{ id, title, summary, body, createdAt }] : [];
      });
    }
    if (Array.isArray(drafts.builds)) {
      state.drafts.builds = drafts.builds.slice(0, 20).flatMap((entry) => {
        if (!plainObject(entry)) return [];
        const id = safeText(entry.id, 80), sourceId = safeText(entry.sourceId, 40), title = safeText(entry.title, 80), createdAt = safeText(entry.createdAt, 40);
        return id && sourceId && title && createdAt ? [{ id, sourceId, title, createdAt }] : [];
      });
    }
    if (Array.isArray(drafts.tierLists)) {
      state.drafts.tierLists = drafts.tierLists.slice(0, 20).flatMap((entry) => {
        if (!plainObject(entry) || !plainObject(entry.tiers)) return [];
        const id = safeText(entry.id, 80), title = safeText(entry.title, 80), description = safeText(entry.description, 220), createdAt = safeText(entry.createdAt, 40);
        const rawTiers = entry.tiers as Record<string, unknown>;
        const tiers = Object.fromEntries((['S', 'A', 'B', 'C', 'D'] as TierLabel[]).map((label) => {
          const row = rawTiers[label];
          return [label, Array.isArray(row) ? row.filter((slug): slug is string => typeof slug === 'string' && HERO_SLUGS.has(slug)).slice(0, 6) : []];
        })) as Record<TierLabel, string[]>;
        return id && title && description && createdAt ? [{ id, title, description, tiers, createdAt }] : [];
      });
    }
    return state;
  } catch {
    return createEmptyCommunityState();
  }
}

function clone(state: CommunityState): CommunityState {
  return parseCommunityState(JSON.stringify(state));
}

export function signInLocal(state: CommunityState, provider: LocalProvider): CommunityState {
  if (provider !== 'google' && provider !== 'discord') throw new Error(`provider: unsupported value ${String(provider)}`);
  const next = clone(state);
  next.profile = { provider, displayName: `Local ${provider === 'google' ? 'Google' : 'Discord'} player` };
  return next;
}

export function signOutLocal(state: CommunityState): CommunityState {
  const next = clone(state);
  next.profile = null;
  return next;
}

export function toggleVote(state: CommunityState, recordKey: string, direction: VoteDirection): CommunityState {
  if (!safeKey(recordKey)) throw new Error(`record key: invalid value ${recordKey}`);
  if (direction !== 1 && direction !== -1) throw new Error(`vote: expected -1 or 1`);
  const next = clone(state);
  if (next.votes[recordKey] === direction) delete next.votes[recordKey];
  else next.votes[recordKey] = direction;
  return next;
}

function requireText(value: string, label: string, max: number): string {
  const result = safeText(value, max);
  if (!result) throw new Error(`${label}: expected 1-${max} characters`);
  return result;
}

export function addGuideDraft(state: CommunityState, input: { title: string; summary: string; body: string }): CommunityState {
  const next = clone(state);
  const draft: GuideDraft = {
    id: `local-guide-${next.drafts.guides.length + 1}`,
    title: requireText(input.title, 'title', 80),
    summary: requireText(input.summary, 'summary', 220),
    body: requireText(input.body, 'body', 5_000),
    createdAt: now()
  };
  next.drafts.guides.unshift(draft);
  return next;
}

export function duplicateBuild(state: CommunityState, input: { sourceId: string; title: string }): CommunityState {
  const next = clone(state);
  const sourceId = requireText(input.sourceId, 'sourceId', 40);
  if (!/^\d+$/.test(sourceId)) throw new Error(`sourceId: expected digits`);
  next.drafts.builds.unshift({ id: `local-build-${next.drafts.builds.length + 1}`, sourceId, title: requireText(input.title, 'title', 80), createdAt: now() });
  return next;
}

export function addTierDraft(state: CommunityState, input: { title: string; description: string; tiers: Record<TierLabel, string[]> }): CommunityState {
  const next = clone(state);
  const tiers = Object.fromEntries((['S', 'A', 'B', 'C', 'D'] as TierLabel[]).map((label) => {
    const values = input.tiers[label] ?? [];
    for (const hero of values) if (!HERO_SLUGS.has(hero)) throw new Error(`hero: unknown value ${hero}`);
    return [label, [...new Set(values)].slice(0, 6)];
  })) as Record<TierLabel, string[]>;
  next.drafts.tierLists.unshift({ id: `local-tier-${next.drafts.tierLists.length + 1}`, title: requireText(input.title, 'title', 80), description: requireText(input.description, 'description', 220), tiers, createdAt: now() });
  return next;
}

export function readCommunityState(storage: Pick<Storage, 'getItem'>): CommunityState {
  try { return parseCommunityState(storage.getItem(COMMUNITY_STORAGE_KEY)); } catch { return createEmptyCommunityState(); }
}

export function writeCommunityState(storage: Pick<Storage, 'setItem'>, state: CommunityState): void {
  const encoded = JSON.stringify(state);
  if (encoded.length > MAX_STATE_BYTES) throw new Error(`community state exceeds ${MAX_STATE_BYTES} bytes`);
  storage.setItem(COMMUNITY_STORAGE_KEY, encoded);
}
