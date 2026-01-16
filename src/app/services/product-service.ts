import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = "https://nti-final-project-backend.onrender.com/api/products";

  constructor(private _httpClient: HttpClient){}

  getAllProducts(
    name: string | null = null,
    minPrice: number | null = null,
    maxPrice: number | null =  null,
    inStock: boolean | null = null,
    categories: string[] = [],
    page: number = 1,
    limit: number = 9
  ): Observable<Product[]> {

    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);

    if (name) {
      params = params.set('name', name);
    }

    if (minPrice !== null) {
      params = params.set('minPrice', minPrice);
    }

    if (maxPrice !== null) {
      params = params.set('maxPrice', maxPrice);
    }

    if (inStock !== null) {
      params = params.set('inStock', inStock);
    }

    if (categories.length > 0) {
      params = params.set('categories', categories.join(','));
    }

    return this._httpClient.get<{products: Product[]}>(this.apiUrl, { params }).pipe(
      map(res => res.products),
      tap(products => console.log('Fetched products array:', products))
    );
  }


  getProductById(id: string): Observable<Product> {
    return this._httpClient.get<{product: Product}>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.product),
      tap(product => console.log(`Fetched product with id=${id}:`, product))
    );
  }

  addProduct(formData: FormData) {
    return this._httpClient.post(`${this.apiUrl}`, formData);
  }

  updateProduct(id: string, formData: FormData) {
    return this._httpClient.put(`${this.apiUrl}/${id}`, formData);
  }


  deleteProduct(id: string){
    return this._httpClient.delete(`${this.apiUrl}/${id}`);
  }
}
