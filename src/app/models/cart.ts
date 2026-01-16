import { Product } from "./product";

export interface Cart {
    _id?: string;
    userId: string;
    items: CartItem[];
    totalPrice: number;
    createdAt: Date;
}

export interface CartItem {
    productId: Product;
    quantity: number;
    priceBerUnit: number;
}
