import { Component, ViewChild, ComponentFactoryResolver, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';

import { AlertComponent } from '../shared/alert/alert.component';
import { PlaceHolderDirective } from './../shared/place-holder/place-holder.directive';
import * as fromApp from '../store/app.reducer';
import * as AuthActions from './store/auth.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  @ViewChild('aForm', {static: false}) authForm: NgForm;
  signupMode = false;
  isLoading = false;
  errorMsg: string = null;
  closeSub: Subscription;
  private userSubscription: Subscription;

  @ViewChild(PlaceHolderDirective, {static: false}) alertHost: PlaceHolderDirective;
  constructor(
    private router: Router,
    private compFactResolver: ComponentFactoryResolver,
    private store: Store<fromApp.AppState>
  ) { }

  ngOnInit() {
    this.userSubscription = this.store.select('auth').subscribe( authData => {
      this.isLoading = authData.loading;
      this.errorMsg = authData.error;
      // console.log(this.errorMsg);
      if (this.errorMsg) {
        this.showError(this.errorMsg);
      }

    });
  }

  onSwitchMode() {
    this.signupMode = !this.signupMode;
  }

  onSubmit() {
    if (!this.authForm.valid) {
      return;
    }
    const email = this.authForm.value.email;
    const password = this.authForm.value.password;

    if (this.signupMode) {
      this.store.dispatch(new AuthActions.SignupStart({email, password})); // short hand notation for email and password
    } else {
      this.store.dispatch(new AuthActions.LoginStart({email, password})); // short hand notation for email and password

    }

    this.authForm.reset();
  }

  onHandleError() {
    // this.errorMsg = null;
    this.store.dispatch(new AuthActions.HandleError());
  }

  private showError(message: string) {
    const alertCmpFactory = this.compFactResolver.resolveComponentFactory(
      AlertComponent
    );

    const alertViewContainerRef = this.alertHost.viewContainerRef;
    alertViewContainerRef.clear();

    const cmpRef = alertViewContainerRef.createComponent(alertCmpFactory);
    cmpRef.instance.message = message;
    this.closeSub = cmpRef.instance.close.subscribe(() => {
      this.closeSub.unsubscribe();
      alertViewContainerRef.clear();

    });

  }

  ngOnDestroy() {
    if (this.closeSub) {
      this.closeSub.unsubscribe();
    }
  }

}
