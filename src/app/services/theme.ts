import { effect, Injectable, computed, inject, signal } from '@angular/core';
import { SAFE_STORAGE, SYSTEM_DARK } from './app-tokens';

export type ThemeMode = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

const MODES: ThemeMode[] = ['system', 'light', 'dark'];

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

/**
 * Dark mode: mặc định theo OS, override lưu localStorage.
 * Storage ném lỗi -> chỉ dùng trong phiên, không sập.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storage = inject(SAFE_STORAGE) as StorageLike | null;
  private systemDark = inject(SYSTEM_DARK);
  readonly storageAvailable = signal(this.storage !== null);

  private readonly PREFIX = 'habeo';
  private readonly KEY = this.PREFIX + '.' + 'theme';
  private readonly system = signal<Theme>(this.systemDark?.matches ? 'dark' : 'light');
  readonly mode = signal<ThemeMode>(this.readStoredMode());

  readonly theme = computed<Theme>(() => {
    const m = this.mode();
    return m === 'system' ? this.system() : m;
  });

  constructor() {
    // Theo dõi OS đổi theme khi đang ở chế độ system (bỏ qua khi SSR/không hỗ trợ)
    if (this.systemDark?.addEventListener) {
      const listener = () => this.system.set(this.systemDark!.matches ? 'dark' : 'light');
      this.systemDark.addEventListener('change', listener);
    }
    // Ghi theme hiện hành lên <html data-theme=...> (chỉ trình duyệt; SSR bỏ qua effect DOM này
    // vì Angular không chạy effect trong Server rendering pass cuối prerender).
    effect(() => {
      const t = this.theme();
      try {
        document.documentElement.setAttribute('data-theme', t);
      } catch {
        /* SSR hoặc môi trường không có document */
      }
    });
  }

  private readStoredMode(): ThemeMode {
    if (!this.storage) return 'system';
    try {
      const raw = this.storage.getItem(this.KEY);
      return MODES.includes(raw as ThemeMode) ? (raw as ThemeMode) : 'system';
    } catch {
      this.storageAvailable.set(false);
      return 'system';
    }
  }

  setMode(mode: ThemeMode): void {
    if (!MODES.includes(mode)) mode = 'system';
    this.mode.set(mode);
    if (!this.storage) {
      this.storageAvailable.set(false);
      return;
    }
    try {
      if (mode === 'system') this.storage.removeItem(this.KEY);
      else this.storage.setItem(this.KEY, mode);
    } catch {
      this.storageAvailable.set(false);
    }
  }

  themeForMode(mode: ThemeMode): Theme {
    return mode === 'system' ? this.system() : mode;
  }
}
