import { Product } from "./Product";

export class OrderItem{
    id: number = 0;
    order_id: number = 0;
    product_id: number = 0;
    unit_price: number = 0;
    quantity: number = 0;
    product: Product = new Product({});

    constructor(obj: Partial<OrderItem>){
        Object.assign(this, obj);
    }

    calculateItemPrice = () => {
        return this.quantity * this.unit_price;
    }
}