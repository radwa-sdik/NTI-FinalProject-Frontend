export interface Address {
    _id?: string,
    userId: string,
    street: string,
    city: string,
    zipCode: string,
    country: string,
    isDefault: boolean,
    createdAt?: Date
}
