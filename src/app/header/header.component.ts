import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';

import * as fromApp from '../store/app.reducer';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipeActions from '../recipes/store/recipe.actions';

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuhtenticated = false;
  userSub: Subscription;

  constructor(
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit() {
     this.userSub = this.store.select('auth')
     .pipe(map(userState => userState.user))
     .subscribe(user => {
      this.isAuhtenticated = !!user;
      console.log(!user);
      console.log(!!user);

    });
  }
  onSaveRecipes() {
    this.store.dispatch(new RecipeActions.StoreRecipes());
  }

  onFetchRecipes() {
    this.store.dispatch(new RecipeActions.FetchRecipes());
  }

  onLogout() {
    this.store.dispatch(new AuthActions.Logout());
  }
  ngOnDestroy() {
    this.userSub.unsubscribe();
  }
}
