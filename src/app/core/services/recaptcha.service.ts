import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: string | HTMLElement, parameters: {
        sitekey: string;
        callback: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark';
        size?: 'compact' | 'normal';
      }) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
    onRecaptchaLoad?: () => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {
  private scriptLoaded = false;
  private scriptLoading = false;
  private loadPromise: Promise<void> | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  get siteKey(): string {
    return environment.recaptcha?.siteKey || '';
  }

  get isEnabled(): boolean {
    return environment.recaptcha?.enabled ?? false;
  }

  loadScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.scriptLoading = true;
    this.loadPromise = new Promise((resolve, reject) => {
      window.onRecaptchaLoad = () => {
        this.scriptLoaded = true;
        this.scriptLoading = false;
        resolve();
      };

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        this.scriptLoading = false;
        reject(new Error('Failed to load reCAPTCHA script'));
      };
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  render(
    container: string | HTMLElement,
    callback: (token: string) => void,
    expiredCallback?: () => void,
    errorCallback?: () => void
  ): Promise<number> {
    return this.loadScript().then(() => {
      return new Promise((resolve) => {
        window.grecaptcha.ready(() => {
          const widgetId = window.grecaptcha.render(container, {
            sitekey: this.siteKey,
            callback: callback,
            'expired-callback': expiredCallback,
            'error-callback': errorCallback,
            theme: 'light',
            size: 'normal'
          });
          resolve(widgetId);
        });
      });
    });
  }

  reset(widgetId?: number): void {
    if (this.scriptLoaded && window.grecaptcha) {
      window.grecaptcha.reset(widgetId);
    }
  }

  getResponse(widgetId?: number): string {
    if (this.scriptLoaded && window.grecaptcha) {
      return window.grecaptcha.getResponse(widgetId);
    }
    return '';
  }
}
