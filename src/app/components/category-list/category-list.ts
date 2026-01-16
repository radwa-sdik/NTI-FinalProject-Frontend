import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-category-list',
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
})
export class CategoryList {
  categories$: Observable<Category[]>;

  constructor(private _categoryService: CategoryService) {
    this.categories$ = this._categoryService.getAllCategories();
  }

  getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Electronics': 'bi bi-laptop',
      'Clothing': 'bi bi-bag',
      'Books': 'bi bi-book',
      'Home': 'bi bi-house',
      'Sports': 'bi bi-activity',
      'Toys': 'bi bi-star',
      'Food': 'bi bi-cup',
      'Beauty': 'bi bi-heart',
      'Furniture': 'bi bi-grid-3x3-gap',
      'Automotive': 'bi bi-truck',
      'Health': 'bi bi-heart-pulse',
      'Garden': 'bi bi-flower1'
    };
    return iconMap[categoryName] || 'bi bi-box';
  }
}
