import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService, type ThemeMode } from './services/theme';
import { ProgressService } from './services/progress';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly progress = inject(ProgressService);
  protected readonly menuOpen = signal(false);

  protected readonly nav = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Lộ trình', path: '/lo-trinh' },
    { label: 'Kiến thức', path: '/kien-thuc' },
    { label: 'Thực hành', path: '/thuc-hanh' },
    { label: 'Giới thiệu', path: '/gioi-thieu' },
  ];

  protected readonly themeIcon: Record<ThemeMode, string> = {
    system: 'auto',
    light: 'sáng',
    dark: 'tối',
  };

  protected toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected cycleTheme(): void {
    const order: ThemeMode[] = ['system', 'light', 'dark'];
    const next = order[(order.indexOf(this.theme.mode()) + 1) % order.length];
    this.theme.setMode(next);
  }
}
