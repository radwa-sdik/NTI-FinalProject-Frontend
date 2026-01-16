import { Category } from "./category";
import { ProductReview } from "./product-review";

export interface ProductImage {
  imageUrl: string;
  isMain: boolean;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;

  productImages: ProductImage[]; 

  rating: number;
  reviewsCount: number;
  reviews?: ProductReview[];
  quantity: number;
  category: Category;
  inStock: boolean;
}
