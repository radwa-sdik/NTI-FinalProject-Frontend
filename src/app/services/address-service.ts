import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Address } from '../models/address';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  apiUrl: string = 'https://nti-final-project-backend.onrender.com/api/addresses';
  constructor(private _httpClient: HttpClient){}

  getCurrentUserAddresses(): Observable<Address[]> {
    return this._httpClient.get<Address[]>(`${this.apiUrl}/`)
    .pipe(
      // Extract the addresses array from the response
      tap(addresses => console.log('Fetched addresses:', addresses))
    );
  }

  getAddressById(id: string): Observable<Address> {
    return this._httpClient.get<Address>(`${this.apiUrl}/${id}`)
    .pipe(
      tap(address => console.log(`Fetched address with id ${id}:`, address))
    );
  }

  addAddress(addressData: Address): Observable<Address> {
    return this._httpClient.post<Address>(`${this.apiUrl}/`, addressData);
  }

  updateAddress(id: string, addressData: Address): Observable<Address> {
    return this._httpClient.put<Address>(`${this.apiUrl}/${id}`, addressData);
  }

  setDefaultAddress(id: string) {
    return this._httpClient.patch(`${this.apiUrl}/${id}/default`, {});
  }

  deleteAddress(id: string) {
    return this._httpClient.delete(`${this.apiUrl}/${id}`);
  }
}
