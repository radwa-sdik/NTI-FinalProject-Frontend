import { Component, Input } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product-service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Cart } from '../../models/cart';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CommonModule, FormsModule, AsyncPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  productId: string = '';
  product$!: Observable<Product>;
  selectedQuantity: number = 1;
  activeTab: string = 'details';
  imageBaseUrl: string = 'https://nti-final-project-backend.onrender.com';

  constructor(private route: ActivatedRoute, private _productService: ProductService,private _cartService:CartService) {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit(){
     this.product$ = this._productService.getProductById(this.productId);
  }

  increaseQuantity(): void {
    this.selectedQuantity++;
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  addToCart(): void {
    console.log(`Added ${this.selectedQuantity} item(s) to cart`);
    this._cartService.addToCart(this.productId,this.selectedQuantity).subscribe({
      next:()=>{
        alert('Product added to cart');
      },
      error:()=>{
        alert('Failed to add product to cart');
      }
    });
  }

  addToWishlist(): void {
    console.log('Added to wishlist');
    // TODO: Implement add to wishlist functionality
  }

  copyLink(): void {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert('Product link copied to clipboard!');
    });
  }
}
