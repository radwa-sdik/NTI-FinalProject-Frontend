import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, BehaviorSubject, Observable } from 'rxjs';
import { ProductReview } from '../models/product-review';

@Injectable({
  providedIn: 'root',
})
export class ProductReviewService {
  private apiUrl = "https://nti-final-project-backend.onrender.com/api/reviews";

  // State management with BehaviorSubject
  private reviewsSubject = new BehaviorSubject<ProductReview[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  constructor(private _httpClient: HttpClient){}

  // Load reviews and update state
  loadProductReviews(productId: string): Observable<ProductReview[]> {
    return this.getProductReviews(productId).pipe(
      tap(reviews => {
        console.log(`Loaded reviews for product ${productId}:`, reviews);
        this.reviewsSubject.next(reviews);
      })
    );
  }

  getProductReviews(productId: string) {
    return this._httpClient.get<{reviews: ProductReview[]}>(`${this.apiUrl}?productId=${productId}`).pipe(
      map(res => res.reviews),
      tap(reviews => console.log(`Fetched reviews for product ${productId}:`, reviews))
    );
  }

  getReviewById(id: string) {
    return this._httpClient.get<{review: ProductReview}>(`${this.apiUrl}/${id}`).pipe(
      map(res => res.review),
      tap(review => console.log(`Fetched review with id ${id}:`, review))
    );
  }

  addProductReview(reviewData: ProductReview) {
    return this._httpClient.post<ProductReview>(`${this.apiUrl}/`, reviewData).pipe(
      tap(addedReview => {
        console.log('Added new review:', addedReview);
        const currentReviews = this.reviewsSubject.value;
        this.reviewsSubject.next([...currentReviews, addedReview]);
      })
    );
  }

  updateProductReview(id: string, reviewData: ProductReview) {
    return this._httpClient.put<ProductReview>(`${this.apiUrl}/${id}`, reviewData).pipe(
      tap(updatedReview => {
        console.log(`Updated review with id ${id}:`, updatedReview);
        const currentReviews = this.reviewsSubject.value;
        const index = currentReviews.findIndex(r => r._id === id);
        if (index !== -1) {
          currentReviews[index] = updatedReview;
          this.reviewsSubject.next([...currentReviews]);
        }
      })
    );
  }

  deleteProductReview(id: string) {
    return this._httpClient.delete<{message: string}>(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        console.log(`Deleted review with id ${id}:`, response.message);
        const currentReviews = this.reviewsSubject.value;
        const filtered = currentReviews.filter(r => r._id !== id);
        this.reviewsSubject.next(filtered);
      })
    );
  }

}
