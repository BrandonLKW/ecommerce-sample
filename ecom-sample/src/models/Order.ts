import { OrderItem } from "./OrderItem";

export enum OrderStatus {
    Pending = "PENDING",
    Processing = "PROCESSING",
    Completed = "COMPLETED",
    Cancelled = "CANCELLED",
    All = "*"
}

export class Order{
    id: number = 0;
    user_id: number = 0;
    created_date: string = "";
    completed_date: string = "";
    status: OrderStatus = OrderStatus.Pending;
    orderItemList: OrderItem[] = [];

    constructor(obj: Partial<Order>){
        Object.assign(this, obj);
    }
}