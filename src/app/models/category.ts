export interface Category {
    _id?: string,
    name: string,
    description: string,
    parentCategory?: Category
}
