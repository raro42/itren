import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../environments/environment';
import { LangService } from './lang.service';
import { MsgKey } from './i18n';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent {
  readonly issuesUrl = environment.githubIssuesUrl;
  readonly newIssueUrl = environment.githubNewIssueUrl;

  constructor(private langSvc: LangService) {}

  msg(key: MsgKey): string {
    return this.langSvc.msg(key);
  }
}
