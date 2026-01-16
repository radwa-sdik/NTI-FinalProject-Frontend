import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { PaymentService } from '../../services/payment-service';
import { CartService } from '../../services/cart-service';
import { AuthService } from '../../services/auth-service';
import { Cart, CartItem } from '../../models/cart';
import { Address } from '../../models/address';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-check-out',
  imports: [CommonModule, RouterLink, AsyncPipe, CurrencyPipe],
  templateUrl: './check-out.html',
  styleUrl: './check-out.css',
})
export class CheckOut implements OnInit, AfterViewInit {
  cart$!: Observable<Cart>;
  addresses$!: Observable<Address[]>;
  
  selectedAddressId: string | undefined = undefined;
  isLoading: boolean = false;
  paypalError: string = '';
  successMessage: string = '';
  errorMessage: string = '';
  
  paypalScriptLoaded: boolean = false;

  constructor(
    private _paymentService: PaymentService,
    private _cartService: CartService,
    private _authService: AuthService,
    private _router: Router
  ) {}

  ngOnInit() {
    this.loadCheckoutData();
    this.loadPayPalScript();
  }

  ngAfterViewInit() {
    if (this.paypalScriptLoaded) {
      this.initializePayPal();
    }
  }

  loadCheckoutData() {
    this.cart$ = this._cartService.getCart();
    this.addresses$ = this._paymentService.getAddresses();
  }

  loadPayPalScript() {
    const clientId = environment.PAYPAL_CLIENT_ID;
    
    if (window.paypal) {
      this.paypalScriptLoaded = true;
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
    script.async = true;
    script.onload = () => {
      this.paypalScriptLoaded = true;
      this.initializePayPal();
    };
    script.onerror = () => {
      this.paypalError = 'Failed to load PayPal SDK. Please refresh the page.';
    };
    document.body.appendChild(script);
  }

  selectAddress(address: Address) {
    this.selectedAddressId = address._id;
  }

  calculateSubtotal(items: CartItem[]): number {
    if (!items) return 0;
    var total = items.reduce((sum, item) => sum + (item.priceBerUnit * item.quantity), 0);
    return total;
  }

  calculateTax(items: CartItem[]): number {
    return this.calculateSubtotal(items) * 0.1;
  }

  calculateTotal(items: CartItem[]): number {
    if (!items) return 0;
    const subtotal = this.calculateSubtotal(items);
    const tax = this.calculateTax(items);
    let shipping = 10;
    if (subtotal >= 50) shipping = 0;
    const total = subtotal + tax + shipping;
    return total;
  }

  initializePayPal() {
    if (!window.paypal) return;

    const paypal = window.paypal;

    paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        if (!this.selectedAddressId) {
          this.paypalError = 'Please select a shipping address';
          return;
        }

        this.isLoading = true;

        return this._paymentService
          .createPaypalOrder(this.selectedAddressId)
          .toPromise()
          .then((response: any) => {
            console.log('PayPal order created:', response);
            if (!response || !response.paypalOrderId) {
              throw new Error('Invalid PayPal order response');
            }
            return response.paypalOrderId;
          })
          .catch((error: any) => {
            this.isLoading = false;
            this.paypalError = error.error?.message || 'Failed to create PayPal order';
            throw error;
          });
      },

      onApprove: (data: any, actions: any) => {
        if (!this.selectedAddressId) {
          this.paypalError = 'Shipping address not selected';
          return Promise.reject();
        }

        return this._paymentService
          .approvePaypalOrder(data.orderID, this.selectedAddressId)
          .toPromise()
          .then((response: any) => {
            if (response?.success) {
              this.successMessage = 'Payment successful! Order created.';
              setTimeout(() => {
                this._router.navigate(['/orders']);
              }, 2000);
            } else {
              throw new Error(response?.message || 'Payment approval failed');
            }
          })
          .catch((error: any) => {
            this.isLoading = false;
            this.errorMessage = error.error?.message || 'Payment approval failed';
            throw error;
          });
      },

      onError: (err: any) => {
        this.isLoading = false;
        this.paypalError = 'Payment error occurred. Please try again.';
        console.error('PayPal error:', err);
      },

      onCancel: () => {
        this.isLoading = false;
        this.errorMessage = 'Payment cancelled';
      },
    }).render('#paypal-button-container');
  }
}

// Augment window interface for PayPal
declare global {
  interface Window {
    paypal?: any;
  }
}
