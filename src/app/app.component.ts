import { Component, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly title = signal('rs1-frontend-2025-26');
  currentLang: string = 'bs';

  constructor(private translate: TranslateService) {
    // Inicijalizacija translate servisa
    this.translate.addLangs(['en', 'bs']);
    this.translate.setDefaultLang('bs');

    // Ucitaj jezik iz localStorage ili koristi default
    const savedLang = localStorage.getItem('language') || 'bs';
    this.currentLang = savedLang;
    this.translate.use(savedLang);
  }

  switchLanguage(lang: string): void {
    this.currentLang = lang;
    localStorage.setItem('language', lang);
    this.translate.use(lang);
  }
}
