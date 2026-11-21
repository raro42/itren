import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'faq',
    loadComponent: () => import('./faq.component').then((m) => m.FaqComponent),
  },
  {
    path: 'feedback',
    loadComponent: () =>
      import('./feedback.component').then((m) => m.FeedbackComponent),
  },
  { path: '**', redirectTo: '' },
];
