export class Product{
    id: string = "";
    product_type: string = "";
    name: string = "";
    image: string = "";
    quantity: number = 0;
    unit_price: number = 0;

    constructor(obj: Partial<Product>){
        Object.assign(this, obj);
    }
}