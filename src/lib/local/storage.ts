import { normalizeSave, parseSaveText, type LocalSave } from './save';

export const SAVE_STORAGE_KEY = 'taskbarhero.local-save.v1';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type StoredSaveResult =
  | { status: 'empty' }
  | { status: 'valid'; save: LocalSave }
  | { status: 'invalid'; message: string };

export function readStoredSave(storage: StorageLike): StoredSaveResult {
  const stored = storage.getItem(SAVE_STORAGE_KEY);
  if (stored === null) return { status: 'empty' };
  try {
    return { status: 'valid', save: parseSaveText(stored) };
  } catch (error) {
    return {
      status: 'invalid',
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

export function writeStoredSave(storage: StorageLike, save: LocalSave): void {
  const normalized = normalizeSave(save);
  storage.setItem(SAVE_STORAGE_KEY, JSON.stringify(normalized));
}

export function clearStoredSave(storage: StorageLike): void {
  storage.removeItem(SAVE_STORAGE_KEY);
}
