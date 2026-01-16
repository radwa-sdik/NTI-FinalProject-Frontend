import { User } from "./user";

export interface ProductReview {
    _id?: string,
    productId: string,
    userId: User,
    rating: number,
    comment: string,
    createdAt: Date
}
