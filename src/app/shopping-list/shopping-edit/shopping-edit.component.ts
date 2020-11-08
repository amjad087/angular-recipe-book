import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import { Ingredient } from '../../shared/ingredient.model';
import * as slActions from '../store/shopping-list.actions';
import * as fromApp from '../../store/app.reducer';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild ('f', {static: true}) slForm: NgForm;
  editedIngredient: Ingredient;
  editMode = false;
  selectedIndex: number;
  subscription: Subscription;
  constructor(
    private store: Store<fromApp.AppState>
    ) { }

  ngOnInit(): void {
    this.subscription = this.store.select('shoppingList').subscribe(stateData => {
      if (stateData.editedIngredientIndex > -1) {
        this.editMode = true;
        this.editedIngredient = stateData.editedIngredient;
        this.slForm.form.setValue({
          name: this.editedIngredient.name,
          amount: this.editedIngredient.amount
        });
      } else {
        this.editMode = false;
      }

    });
  }

  onSubmit() {
    const name = this.slForm.form.value.name;
    const amount = this.slForm.form.value.amount;
    const ingredient = new Ingredient(name, amount);
    if (this.editMode) {
      this.store.dispatch(new slActions.UpdateIngredient(ingredient));
    } else {
      this.store.dispatch(new slActions.AddIngredient(ingredient));
    }
    this.onClear();
  }

  onDeleteIngredient() {
    this.store.dispatch(new slActions.DeleteIngredient());
    this.onClear();
  }

  onClear() {
    this.editMode = false;
    this.slForm.reset();
    this.store.dispatch(new slActions.StopEdit());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.store.dispatch(new slActions.StopEdit());
  }

}
