import { OrderItem } from "./OrderItem";

export enum OrderStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    All = "*"
}

export class Order{
    id: number = 0;
    user_id: number = 0;
    created_date: string = "";
    completed_date: string = "";
    status: OrderStatus = OrderStatus.PENDING;
    orderItemList: OrderItem[] = [];

    constructor(obj: Partial<Order>){
        Object.assign<Order, Partial<Order>>(this, obj);
    }
}