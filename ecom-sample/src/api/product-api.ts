import { Product } from "../models/Product";

const BASE_URL = "/api/product/";

export async function getAllProducts(){
    try {
        const response = await fetch(BASE_URL + "all", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        })
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

//Future reference
//https://blog.logrocket.com/axios-vs-fetch-best-http-requests/
//https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//https://stackoverflow.com/questions/41103360/how-to-use-fetch-in-typescript