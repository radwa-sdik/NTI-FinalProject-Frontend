import { Injectable } from '@angular/core';
import { Category } from '../models/category';
import { map, Observable, tap, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = "https://nti-final-project-backend.onrender.com/api/categories";
  
  // State management with BehaviorSubject
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  constructor(private _httpClient: HttpClient){}

  // Load categories and update state
  loadCategories(): Observable<Category[]> {
    return this.getAllCategories().pipe(
      tap(categories => {
        console.log('Loaded categories:', categories);
        this.categoriesSubject.next(categories);
      })
    );
  }

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
    return this._httpClient.post(`${this.apiUrl}/`, categoryData).pipe(
      tap(() => {
        this.loadCategories().subscribe();
      })
    );
  }

  updateCategory(id: string, categoryData: Category){
    return this._httpClient.put(`${this.apiUrl}/${id}`, categoryData).pipe(
      tap(() => {
        this.loadCategories().subscribe();
      })
    );
  }

  deleteCategory(id: string){
    return this._httpClient.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.loadCategories().subscribe();
      })
    );
  }
}
