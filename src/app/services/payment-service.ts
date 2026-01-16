import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Address } from '../models/address';


@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = 'https://nti-final-project-backend.onrender.com/api';
  private paypalUrl = `${this.apiUrl}/payment/paypal`;
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
    console.log('Creating PayPal order with addressId:', addressId);
    return this._httpClient.post<any>(`${this.paypalUrl}/create-order`, {
      addressId,
    }).pipe(tap(response => {
      console.log('Create PayPal Order Response:', response);
    }));
  }

  /**
   * Approve a PayPal order
   * POST /paypal/approve
   */
  approvePaypalOrder(paypalOrderId: string, addressId: string): Observable<any> {
    return this._httpClient.post<any>(`${this.paypalUrl}/approve`, {
      paypalOrderId,
      addressId,
    });
  }
}
