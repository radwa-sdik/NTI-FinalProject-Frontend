import { Address } from "./address";
import { Product } from "./product";

export interface Order {
    _id?:string;
    userId: string;
    addressId: Address;
    products: [{
        productId: Product;
        quantity: number;
        price: number;
        _id: string;
    }],
    subTotal: number;
    totalPrice: number;
    tax: number;
    shipping: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: Date;
    updatedAt: Date;
}
