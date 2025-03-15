import { Order } from "../models/Order";

const BASE_URL = "/api/order/";

export async function getAllOrders() {
    try {
        const response = await fetch(BASE_URL + "all", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();
        if (response.ok) {
            return result;
        } else {
            throw new Error(`Response status: ${response.status}, ${JSON.stringify(result)}`);
        }
    } catch (error) {
        return { error: error};
    }
} 

export async function getOrdersByUser() {
    try {
        const response = await fetch(BASE_URL + "get", {
            method: "GET",
            headers: { 
                "Content-Type": "application/json", 
                "auth-token": `${localStorage.getItem("auth-token")}` 
            }
        });
        const result = await response.json();
        if (response.ok) {
            return result;
        } else {
            throw new Error(`Response status: ${response.status}, ${JSON.stringify(result)}`);
        }
    } catch (error) {
        return { error: error};
    }
}

export async function getOrdersByStatus(status: string) {
    try {
        const response = await fetch(BASE_URL + `get/status/${status}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();
        if (response.ok) {
            return result;
        } else {
            throw new Error(`Response status: ${response.status}, ${JSON.stringify(result)}`);
        }
    } catch (error) {
        return { error: error };
    }
}

export async function getOrderItemsByOrderId(order_id: number) {
    try {
        const response = await fetch(BASE_URL + `item/get/order_id/${order_id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });
        const result = await response.json();
        if (response.ok) {
            return result;
        } else {
            throw new Error(`Response status: ${response.status}, ${JSON.stringify(result)}`);
        }
    } catch (error) {
        return { error: error };
    }
}

export async function addOrder(order: Order) {
    try {
        const response = await fetch(BASE_URL + "add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
        });
        const result = await response.json();
        if (response.ok) {
            return result;
        } else {
            throw new Error(`Response status: ${response.status}, ${JSON.stringify(result)}`);
        }
    } catch (error) {
        return { error: error};
    }
}

export async function updateOrder(order: Order) {
    try {
        const response = await fetch(BASE_URL + "update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
        });
        const result = await response.json();
        if (response.ok) {
            return result;
        } else {
            throw new Error(`Response status: ${response.status}, ${JSON.stringify(result)}`);
        }
    } catch (error) {
        return { error: error};
    }
}