import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Order } from '../models/order';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = "https://nti-final-project-backend.onrender.com/api/orders";
  constructor(private _httpClient: HttpClient) {}

  getCurrentUserOrders() {
    return this._httpClient.get<Order[]>(`${this.apiUrl}/`);
  }

  getAllOrders() {
    return this._httpClient.get<Order[]>(`${this.apiUrl}/all`)
    .pipe(tap(response => {
      console.log('All Orders Response:', response);
    }));
  }

  updateOrderStatus(orderId: string, status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled') {
    return this._httpClient.put<Order>(`${this.apiUrl}/${orderId}/updateStatus`, { status });
  }
}
