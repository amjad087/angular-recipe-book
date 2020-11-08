import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Recipe } from './../recipe.model';
import * as fromApp from '../../store/app.reducer';
import * as fromRecipes from '../store/recipe.reducer';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit {
  recipesObs: Observable<{recipes: Recipe[]}>;
  constructor(
    private router: Router,
    private store: Store<fromApp.AppState>
  ) {}

  ngOnInit(): void {
    this.recipesObs = this.store.select('recipe');
    // this.recipeService.recipeChanged.subscribe((recipes: Recipe[]) => {
    //   this.recipes = recipes;
    // });
    // this.recipes = this.recipeService.getRecipes();
  }

  onAddNewRecipe() {
    this.router.navigate(['/recipes', 'new']);
  }
}
