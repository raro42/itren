import { Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { FeedbackComponent } from './feedback.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'feedback', component: FeedbackComponent },
  { path: '**', redirectTo: '' },
];
