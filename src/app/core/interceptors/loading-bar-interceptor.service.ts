import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingBarService } from '../services/loading-bar.service';

export const loadingBarInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingBar = inject(LoadingBarService);

  if (shouldSkipLoadingBar(req.url)) {
    return next(req);
  }

  loadingBar.show();

  return next(req).pipe(
    finalize(() => {
      loadingBar.hide();
    })
  );
};

function shouldSkipLoadingBar(url: string): boolean {
  const skipPatterns = [
    '/notifications/poll',
    '/messages/poll',
    '/health',
    '/ping',
    '/status',
    '/analytics',
    '/tracking',
  ];

  return skipPatterns.some(pattern => url.includes(pattern));
}
