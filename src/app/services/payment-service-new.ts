import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Address {
  _id: string;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'https://nti-final-project-backend.onrender.com/api';
  private paypalUrl = `${this.apiUrl}/paypal`;
  private addressesUrl = `${this.apiUrl}/addresses`;

  constructor(private _httpClient: HttpClient) {}

  /**
   * Get all addresses for the current user
   */
  getAddresses(): Observable<Address[]> {
    return this._httpClient.get<Address[]>(this.addressesUrl);
  }

  /**
   * Create a PayPal order
   * POST /paypal/create-order
   */
  createPaypalOrder(addressId: string): Observable<any> {
    return this._httpClient.post<any>(`${this.paypalUrl}/create-order`, {
      addressId,
    });
  }

  /**
   * Approve a PayPal order
   * POST /paypal/approve
   */
  approvePaypalOrder(orderID: string, addressId: string): Observable<any> {
    return this._httpClient.post<any>(`${this.paypalUrl}/approve`, {
      orderID,
      addressId,
    });
  }
}
