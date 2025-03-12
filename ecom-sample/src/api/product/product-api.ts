import { Product } from "../../models/Product";

const BASE_URL = "/api/product/";

export async function getAllProducts(){
    const res = await fetch(BASE_URL + "all", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    if (res.ok) {
        return res.json();
    } else {
        throw new Error("Invalid Call");
    }
} 


//Future reference
//https://blog.logrocket.com/axios-vs-fetch-best-http-requests/