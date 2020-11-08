import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {Actions, ofType, Effect} from '@ngrx/effects';
import { switchMap, catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import * as AuthActions from './auth.actions';
import { User } from '../user.model';
import { AuthService } from './../auth.service';

export interface AuthResponseData {
  idToken:	string;
  email:	string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

const handleAuthentication = (expireIn: Date, email: string, userId: string, token: string) => {
  const user = new User(email, userId, token, expireIn);
  localStorage.setItem('userData', JSON.stringify(user));

  return new AuthActions.Login({
    email,
    userId,
    token,
    expDate: expireIn,
    redirect: true
  });
};
const handleError = (errorRes: any) => {
  let errorMessage = 'An Unknown Error Occured!';
  if (!errorRes.error || !errorRes.error.error) {
    return of(new AuthActions.LoginFail(errorMessage));
  }
  switch (errorRes.error.error.message) {
    case 'EMAIL_EXISTS':
      errorMessage = 'This Email is already in use!';
      break;
    case 'INVALID_PASSWORD':
    case 'EMAIL_NOT_FOUND':
      errorMessage = 'Email or password is incorrect!';
      break;

  }
  return of(new AuthActions.LoginFail(errorMessage));
};
@Injectable()
export class AuthEffects {
  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.SIGNUP_START),
    switchMap((authData: AuthActions.SignupStart) => {
      return this.http.post<AuthResponseData>
      ('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
      {
        email: authData.payload.email,
        password: authData.payload.password,
        returnSecureToken: true
      }
    )
    .pipe(
      tap((resData) => {
        this.authService.setLogoutTimer(+resData.expiresIn * 1000);
      }),
      map(resData => {
        const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
        return handleAuthentication(expirationDate, resData.email, resData.localId, resData.idToken);
      }),
      catchError(errorRes => {
        return handleError(errorRes);
      })
    );
    })
  );

  @Effect()
  authLogin = this.actions$.pipe(
    ofType(AuthActions.LOGIN_START),
    switchMap((authData: AuthActions.LoginStart) => {
      return this.http.post<AuthResponseData>
      ('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
      {
        email: authData.payload.email,
        password: authData.payload.password,
        returnSecureToken: true
      }
    )
    .pipe(
      tap((resData) => {
        this.authService.setLogoutTimer(+resData.expiresIn * 1000);
      }),
      map(resData => {
        const expirationDate = new Date(new Date().getTime() + +resData.expiresIn * 1000);
        return handleAuthentication(
          expirationDate,
          resData.email,
          resData.localId,
          resData.idToken
        );
      }),
      catchError(errorRes => {
        return handleError(errorRes);
      })
    );
    })
  );

  @Effect({dispatch: false})
  loginSuccess = this.actions$.pipe(
    ofType(AuthActions.LOGIN),
    tap((loginSuccess: AuthActions.Login) => {
      if(loginSuccess.payload.redirect) {
        this.router.navigate(['/']);
      }
    })
  );

  @Effect({dispatch: false})
  logOut = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      localStorage.removeItem('userData');
      this.authService.clearLogoutTimer();
      this.router.navigate(['/auth']);
    })
  );

  @Effect()
  autoLogin = this.actions$.pipe(
    ofType(AuthActions.AUTO_LOGIN),
    map(() => {
      const userData: {
        email: string,
        id: string,
        _token: string,
        _tokenExpirationDate: string
      } = JSON.parse(localStorage.getItem('userData'));

      if (!userData) {
        return {type: 'DUMMY'};
      }

      const loadedUser = new User(
        userData.email,
        userData.id,
        userData._token,
        new Date(userData._tokenExpirationDate)
      );

      if (loadedUser.token) {
        const remainingDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        this.authService.setLogoutTimer(remainingDuration);
        return new AuthActions.Login({
          email: loadedUser.email,
          userId: loadedUser.id,
          token: loadedUser.token,
          expDate: new Date(userData._tokenExpirationDate),
          redirect: false
        });

        // const remainingDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
        // this.autoLogout(remainingDuration);
      } else {
        return {type: 'DUMMY'};
      }
    })
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}
}
