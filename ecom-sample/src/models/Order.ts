import { OrderItem } from "./OrderItem";

export class Order{
    id: number = 0;
    user_id: number = 0;
    created_date: string = "";
    completed_date: string = "";
    status: string = "PENDING";
    orderItemList: OrderItem[] = [];

    constructor(obj: Partial<Order>){
        Object.assign(this, obj);
    }
}