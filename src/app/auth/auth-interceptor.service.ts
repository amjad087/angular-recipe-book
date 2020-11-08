import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpParams } from '@angular/common/http';
import { take, exhaustMap, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  constructor(
    private store: Store<fromApp.AppState>
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return this.store.select('auth')
    .pipe(
      take(1),
      map(userData => {
        return userData.user;
      }),
      exhaustMap(user => {
        if (!user) {
          console.log('no user');

          return next.handle(req);
        }
        const modeifiedReq = req.clone(
          {
            params: new HttpParams().set('auth', user.token)
          }
        );
        return next.handle(modeifiedReq);
      })
    );

  }
}
