import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../models/product';
import { map, Observable, tap, BehaviorSubject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = "https://nti-final-project-backend.onrender.com/api/products";

  // State management with BehaviorSubject
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  private filterStateSubject = new BehaviorSubject<{
    name: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    inStock: boolean | null;
    categories: string[];
    page: number;
    limit: number;
  }>({
    name: null,
    minPrice: null,
    maxPrice: null,
    inStock: null,
    categories: [],
    page: 1,
    limit: 100
  });

  constructor(private _httpClient: HttpClient){}

  // Load products based on filters
  loadProducts(
    name: string | null = null,
    minPrice: number | null = null,
    maxPrice: number | null = null,
    inStock: boolean | null = null,
    categories: string[] = [],
    page: number = 1,
    limit: number = 100
  ): Observable<Product[]> {
    const filterState = {
      name,
      minPrice,
      maxPrice,
      inStock,
      categories,
      page,
      limit
    };
    this.filterStateSubject.next(filterState);

    return this.getAllProducts(name, minPrice, maxPrice, inStock, categories, page, limit).pipe(
      tap(products => {
        console.log('Loaded products:', products);
        this.productsSubject.next(products);
      })
    );
  }

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

  addProduct(productData: Product | FormData) {
    return this._httpClient.post(`${this.apiUrl}`, productData).pipe(
      tap(() => {
        const filterState = this.filterStateSubject.value;
        this.loadProducts(
          filterState.name,
          filterState.minPrice,
          filterState.maxPrice,
          filterState.inStock,
          filterState.categories,
          filterState.page,
          filterState.limit
        ).subscribe();
      })
    );
  }

  updateProduct(id: string, productData: Product | FormData) {
    return this._httpClient.put(`${this.apiUrl}/${id}`, productData).pipe(
      tap(() => {
        const filterState = this.filterStateSubject.value;
        this.loadProducts(
          filterState.name,
          filterState.minPrice,
          filterState.maxPrice,
          filterState.inStock,
          filterState.categories,
          filterState.page,
          filterState.limit
        ).subscribe();
      })
    );
  }

  deleteProduct(id: string) {
    return this._httpClient.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const filterState = this.filterStateSubject.value;
        this.loadProducts(
          filterState.name,
          filterState.minPrice,
          filterState.maxPrice,
          filterState.inStock,
          filterState.categories,
          filterState.page,
          filterState.limit
        ).subscribe();
      })
    );
  }

  getFilterState() {
    return this.filterStateSubject.asObservable();
  }
}
