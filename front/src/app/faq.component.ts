import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LangService } from './lang.service';
import { MsgKey } from './i18n';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css',
})
export class FaqComponent implements OnInit {
  constructor(
    private langSvc: LangService,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.title.setTitle(`${this.msg('brand')} · ${this.msg('faqTitle')}`);
  }

  msg(key: MsgKey): string {
    return this.langSvc.msg(key);
  }
}
