import { Injectable, computed, inject, signal } from '@angular/core';
import { SAFE_STORAGE } from './app-tokens';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

function parseIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * Đánh dấu "đã hoàn thành" theo id bài, lưu localStorage.
 * Storage hỏng (ném lỗi / null) -> vẫn toggle được trong phiên, chỉ mất bền vững.
 */
@Injectable({ providedIn: 'root' })
export class ProgressService {
  private storage = inject(SAFE_STORAGE) as StorageLike | null;
  readonly storageAvailable = signal(this.storage !== null);

  private readonly PREFIX = 'habeo';
  private readonly KEY = this.PREFIX + '.' + 'progress';
  private inMemory = new Set<string>();
  private ids = signal<ReadonlySet<string>>(new Set());

  constructor() {
    this.ids.set(new Set(this.load()));
  }

  private load(): string[] {
    if (!this.storage) return [];
    try {
      return parseIds(this.storage.getItem(this.KEY));
    } catch {
      this.storageAvailable.set(false);
      return [];
    }
  }

  isDone(id: string): boolean {
    return this.ids().has(id);
  }

  doneCount(): number {
    return this.ids().size;
  }

  toggle(id: string): void {
    const next = new Set(this.ids());
    if (next.has(id)) {
      next.delete(id);
      this.inMemory.delete(id);
    } else {
      next.add(id);
      this.inMemory.add(id);
    }
    this.ids.set(next);
    this.persist(next);
  }

  private persist(next: ReadonlySet<string>): void {
    if (!this.storage) {
      this.storageAvailable.set(false);
      return;
    }
    try {
      this.storage.setItem(this.KEY, JSON.stringify([...next]));
    } catch {
      this.storageAvailable.set(false);
    }
  }
}
