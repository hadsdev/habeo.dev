import { InjectionToken, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Minimal Storage-like contract để test chèn map giả dễ dàng. */
export interface SafeStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * localStorage an toàn cho SSR: null khi không phải trình duyệt.
 * Ở trình duyệt trả về window.localStorage thật — quyền chống lỗi
 * "storage ném exception" (private mode) thuộc về phía người dùng (read/write có try/catch).
 */
export const SAFE_STORAGE = new InjectionToken<SafeStorageLike | null>('SAFE_STORAGE', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId)) return null;
    try {
      const probe = '__habeo_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return window.localStorage;
    } catch {
      return null;
    }
  },
});

/** MediaQueryList prefers-color-scheme (null khi SSR hoặc trình duyệt cũ). */
export const SYSTEM_DARK = new InjectionToken<{
  matches: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
} | null>('SYSTEM_DARK', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    if (!isPlatformBrowser(platformId) || !window.matchMedia) return null;
    return window.matchMedia('(prefers-color-scheme: dark)');
  },
});
