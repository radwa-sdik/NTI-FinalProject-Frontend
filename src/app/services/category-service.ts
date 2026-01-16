import { Injectable } from '@angular/core';
import { Category } from '../models/category';
import { map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = "https://nti-final-project-backend.onrender.com/api/categories";
  constructor(private _httpClient: HttpClient){}

  getAllCategories() : Observable<Category[]> {
    return this._httpClient.get<{ categories: Category[] }>(`${this.apiUrl}`)
    .pipe(
      map(res => res.categories),
      tap(categories => console.log('Fetched categories array:', categories))
    );
  }

  getCategoryById(id: string): Observable<Category> {
    return this._httpClient.get<Category>(`${this.apiUrl}/${id}`);
  }

  addCategory(categoryData: Category){
    return this._httpClient.post(`${this.apiUrl}/`, categoryData);
  }

  updateCategory(id: string, categoryData: Category){
    return this._httpClient.put(`${this.apiUrl}/${id}`, categoryData);
  }

  deleteCategory(id: string){
    return this._httpClient.delete(`${this.apiUrl}/${id}`);
  }
}
