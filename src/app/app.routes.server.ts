import { RenderMode, ServerRoute } from '@angular/ssr';
import { CONTENT } from './generated/content.generated';

const slugsFor = (type: 'article' | 'lab' | 'path') => async () =>
  CONTENT.filter((i) => i.type === type).map((i) => ({ slug: i.slug }));

/** Prerender mọi URL công khai; route lạ render client (SPA 404). */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'lo-trinh', renderMode: RenderMode.Prerender },
  { path: 'kien-thuc', renderMode: RenderMode.Prerender },
  { path: 'thuc-hanh', renderMode: RenderMode.Prerender },
  { path: 'gioi-thieu', renderMode: RenderMode.Prerender },
  {
    path: 'kien-thuc/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: slugsFor('article'),
  },
  {
    path: 'thuc-hanh/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: slugsFor('lab'),
  },
  {
    path: 'lo-trinh/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: slugsFor('path'),
  },
  { path: '**', renderMode: RenderMode.Client },
];
