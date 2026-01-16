import { Component, Input } from '@angular/core';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product-service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Cart } from '../../models/cart';
import { CartService } from '../../services/cart-service';
import { ProductReviewService } from '../../services/product-review-service';
import { AuthService } from '../../services/auth-service';
import { ProductReview } from '../../models/product-review';

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  productId: string = '';
  product$!: Observable<Product>;
  reviews$: Observable<ProductReview[]>;
  selectedQuantity: number = 1;
  activeTab: string = 'details';
  imageBaseUrl: string = 'https://nti-final-project-backend.onrender.com';
  currentUserId: string = '';

  // Review form state
  showReviewForm: boolean = false;
  isEditingReview: boolean = false;
  reviewForm: FormGroup;
  currentEditingReviewId: string | null = null;
  successMessage: string = '';
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private _productService: ProductService,
    private _cartService: CartService,
    private _productReviewService: ProductReviewService,
    private _authService: AuthService
  ) {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    this.reviews$ = this._productReviewService.reviews$;
    
    this.reviewForm = new FormGroup({
      rating: new FormControl(5, [Validators.required, Validators.min(1), Validators.max(5)]),
      comment: new FormControl('', [Validators.required, Validators.minLength(10)])
    });

    this._authService.currentUserId$.subscribe(id => {
      this.currentUserId = id || '';
    });
  }

  ngOnInit(){
    this.product$ = this._productService.getProductById(this.productId);
    this._productReviewService.loadProductReviews(this.productId).subscribe();
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
    this._cartService.addToCart(this.productId, this.selectedQuantity).subscribe({
      next: () => {
        alert('Product added to cart');
      },
      error: () => {
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

  // Review methods
  openReviewForm(): void {
    this.showReviewForm = true;
    this.isEditingReview = false;
    this.reviewForm.reset({ rating: 5, comment: '' });
    this.currentEditingReviewId = null;
    this.clearMessages();
  }

  closeReviewForm(): void {
    this.showReviewForm = false;
    this.reviewForm.reset({ rating: 5, comment: '' });
    this.isEditingReview = false;
    this.currentEditingReviewId = null;
  }

  openEditReview(review: ProductReview): void {
    this.isEditingReview = true;
    this.showReviewForm = true;
    this.currentEditingReviewId = review._id || null;
    this.reviewForm.patchValue({
      rating: review.rating,
      comment: review.comment
    });
    this.clearMessages();
  }

  submitReview(): void {
  if (this.reviewForm.invalid) return;

  const reviewData: ProductReview = {
    productId: this.productId,
    userId: { _id: this.currentUserId } as any,
    rating: this.reviewForm.value.rating,
    comment: this.reviewForm.value.comment,
    createdAt: new Date()
  };

  let observable = this.isEditingReview && this.currentEditingReviewId
    ? this._productReviewService.updateProductReview(this.currentEditingReviewId, reviewData)
    : this._productReviewService.addProductReview(reviewData);

  observable.subscribe({
    next: () => {
      this.successMessage = this.isEditingReview ? 'Review updated successfully!' : 'Review added successfully!';
      
      // Reload reviews after add/update
      this._productReviewService.loadProductReviews(this.productId).subscribe(() => {
        this.closeReviewForm();
        this.clearMessages();
      });
    },
    error: () => {
      this.errorMessage = 'Failed to submit review. Please try again.';
    }
  });
}


  deleteReview(reviewId: string | undefined): void {
    if (!reviewId || !confirm('Are you sure you want to delete this review?')) {
      return;
    }

    this._productReviewService.deleteProductReview(reviewId).subscribe({
      next: () => {
        this.successMessage = 'Review deleted successfully!';
        setTimeout(() => this.clearMessages(), 1500);
      },
      error: () => {
        this.errorMessage = 'Failed to delete review. Please try again.';
      }
    });
  }

  isUserReview(review: ProductReview): boolean {
    return review.userId._id === this.currentUserId;
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
