import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home').then((m) => m.HomePage),
  },
  {
    path: 'lo-trinh',
    loadComponent: () => import('./pages/path-list').then((m) => m.PathListPage),
  },
  {
    path: 'kien-thuc',
    loadComponent: () => import('./pages/library').then((m) => m.LibraryPage),
  },
  {
    path: 'thuc-hanh',
    loadComponent: () => import('./pages/lab-list').then((m) => m.LabListPage),
  },
  {
    path: 'gioi-thieu',
    loadComponent: () => import('./pages/about').then((m) => m.AboutPage),
  },
  // chi tiết bài: /kien-thuc/:slug, /thuc-hanh/:slug, /lo-trinh/:slug
  {
    path: 'kien-thuc/:slug',
    loadComponent: () => import('./pages/content-page').then((m) => m.ContentPage),
  },
  {
    path: 'thuc-hanh/:slug',
    loadComponent: () => import('./pages/content-page').then((m) => m.ContentPage),
  },
  {
    path: 'lo-trinh/:slug',
    loadComponent: () => import('./pages/content-page').then((m) => m.ContentPage),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found').then((m) => m.NotFoundPage),
  },
];
