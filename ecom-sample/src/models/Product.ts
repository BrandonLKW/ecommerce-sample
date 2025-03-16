export enum ProductType {
    FRUIT = "FRUIT",
    VEGETABLE = "VEGETABLE",
    BEVERAGE = "BEVERAGE"
}

export class Product{
    id: number = 0;
    product_type: string = "";
    name: string = "";
    image: string = "";
    quantity: number = 0;
    unit_price: number = 0;

    constructor(obj: Partial<Product>){
        Object.assign<Product, Partial<Product>>(this, obj); 
    }
}

//ref: https://stackoverflow.com/questions/55583732/what-is-the-purpose-of-object-assign-in-the-constructor-of-a-typescript-object?rq=3