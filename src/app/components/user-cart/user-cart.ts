import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CartService } from '../../services/cart-service';
import { AuthService } from '../../services/auth-service';
import { ProductService } from '../../services/product-service';
import { Cart, CartItem } from '../../models/cart';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-user-cart',
  imports: [CommonModule, RouterLink, AsyncPipe, CurrencyPipe],
  templateUrl: './user-cart.html',
  styleUrl: './user-cart.css',
})
export class UserCart {
  userCart$!: Observable<Cart | null>;
  isLoggedIn$: Observable<boolean>;
  successMessage: string = '';
  errorMessage: string = '';
  currentQuantityMap: Map<string, number> = new Map();
  productNameMap: Map<string, string> = new Map();
  constructor(
    private _cartService: CartService,
    private _authService: AuthService,
    private _productService: ProductService
  ) {
    this.isLoggedIn$ = this._authService.isLoggedIn$;
  }

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    // this.userCart$ = this._cartService.cart$;
    this.userCart$ = this._cartService.getCart();
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

  removeItem(productId: string) {
    if (!confirm('Are you sure you want to remove this item?')) {
      return;
    }

    this._cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.successMessage = 'Item removed from cart';

        setTimeout(() => this.clearMessages(), 2000);
        this.loadCart();
      },
      error: () => {
        this.errorMessage = 'Failed to remove item';
        setTimeout(() => this.clearMessages(), 2000);
      }
    });
  }

  increaseQuantity(productId: string, currentQuantity: number) {
    this.updateQuantityOptimistic(productId, 1);
  }

  decreaseQuantity(productId: string, currentQuantity: number) {
    this.updateQuantityOptimistic(productId, -1);
  }

  updateQuantityOptimistic(productId: string, delta: number) {
    const cart = this._cartService.cartSubject.value;
    if (!cart) return;

    const item = cart.items.find(i => i.productId.id === productId);
    if (!item) return;

    const oldQuantity = item.quantity;

    item.quantity += delta;

    this._cartService.cartSubject.next({ ...cart });

    this._cartService.updateCartItem(productId, item.quantity).subscribe({
      error: () => {
        item.quantity = oldQuantity;
        this._cartService.cartSubject.next({ ...cart });

        this.errorMessage = 'Failed to update quantity';
        setTimeout(() => this.clearMessages(), 2000);
      }
    });
  }


  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }
}