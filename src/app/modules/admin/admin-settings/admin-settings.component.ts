import { Component, OnInit, inject } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { TranslateService } from '@ngx-translate/core';
import { AuthFacadeService } from '../../../core/services/auth/auth-facade.service';
import { CurrentUserDto } from '../../../core/services/auth/current-user.dto';

@Component({
  selector: 'app-admin-settings',
  standalone: false,
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.scss',
})
export class AdminSettingsComponent implements OnInit {
  private authService = inject(AuthFacadeService);
  private translate = inject(TranslateService);

  currentUser: CurrentUserDto | null = null;
  selectedLanguage = 'bs';

  languages = [
    { code: 'bs', name: 'Bosanski', flag: '🇧🇦' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser();
    this.selectedLanguage = localStorage.getItem('language') || 'bs';
  }

  onLanguageChange(event: MatSelectChange): void {
    const langCode = event.value;
    this.selectedLanguage = langCode;
    localStorage.setItem('language', langCode);
    this.translate.use(langCode);
  }

  getUserRole(): string {
    if (!this.currentUser) return 'Korisnik';
    if (this.currentUser.isAdmin) return 'Administrator';
    if (this.currentUser.isManager) return 'Menadzer';
    if (this.currentUser.isEmployee) return 'Zaposlenik';
    return 'Korisnik';
  }
}
