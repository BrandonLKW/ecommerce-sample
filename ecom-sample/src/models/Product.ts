export enum ProductType {
    Fruit = "FRUIT",
    Vegetable = "VEGETABLE",
    Beverage = "BEVERAGE"
}

export class Product{
    id: number = 0;
    product_type: string = "";
    name: string = "";
    image: string = "";
    quantity: number = 0;
    unit_price: number = 0;

    constructor(obj: Partial<Product>){
        Object.assign(this, obj);
    }
}