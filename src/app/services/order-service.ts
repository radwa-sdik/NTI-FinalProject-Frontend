import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../models/order';
import { map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = "https://nti-final-project-backend.onrender.com/api/orders";
  constructor(private _httpClient: HttpClient) { }

  getCurrentUserOrders() {
    return this._httpClient.get<Order[]>(`${this.apiUrl}/`)
    .pipe(
      map(response => response.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }))
    );
  }

  getAllOrders() {
    return this._httpClient.get<Order[]>(`${this.apiUrl}/all`)
      .pipe(
        map(response => response.sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })),
        tap(response => {
          console.log('All Orders Response:', response);
        }));
  }

  updateOrderStatus(orderId: string, status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') {
    return this._httpClient.put<Order>(`${this.apiUrl}/${orderId}/updateStatus`, { status });
  }
}
