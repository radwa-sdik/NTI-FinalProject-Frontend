import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cart } from '../models/cart';
import { BehaviorSubject, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  apiUrl: string = 'https://nti-final-project-backend.onrender.com/api/carts';
  cartSubject = new BehaviorSubject<Cart | null>(null);
  cart$ = this.cartSubject.asObservable();



  constructor(private _httpClient: HttpClient) {}

  getCart() {
    return this._httpClient.get<Cart>(this.apiUrl).pipe(
      tap(cart => this.cartSubject.next(cart))
    );
  }

  addToCart(productId: string, quantity: number) {
    return this._httpClient.post<any>(`${this.apiUrl}/add`, {
      productId,
      quantity,
    });
  }

  updateCartItem(productId: string, quantity: number) {
    return this._httpClient.put<any>(`${this.apiUrl}/update`, {
      productId,
      quantity,
    });
  }

  removeFromCart(productId: string) {
    return this._httpClient.delete<any>(`${this.apiUrl}/remove`,{body: { productId }});
  }

  clearCart() {
    return this._httpClient.delete<any>(`${this.apiUrl}/clear`);
  }
}
