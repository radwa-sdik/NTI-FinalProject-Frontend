import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule,RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product: Product | null = null;
  imageBaseUrl: string = 'https://nti-final-project-backend.onrender.com';
  constructor(private _cartService: CartService){

  }

  addToCart(product: Product | null){
    if(!product) return;
    this._cartService.addToCart(product.id!,1).subscribe({
      next:()=>{
        alert('Product added to cart');
      },
      error:()=>{
        alert('Failed to add product to cart');
      }
    });
  }
}
