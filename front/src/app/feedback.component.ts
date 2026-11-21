import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
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
export class FeedbackComponent implements OnInit {
  readonly issuesUrl = environment.githubIssuesUrl;
  readonly newIssueUrl = environment.githubNewIssueUrl;

  constructor(
    private langSvc: LangService,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle(`${this.msg('brand')} · ${this.msg('feedbackTitle')}`);
  }

  msg(key: MsgKey): string {
    return this.langSvc.msg(key);
  }
}
