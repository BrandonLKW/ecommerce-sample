import { User } from "../models/User";

const BASE_URL = "https://ecom-sample-backend.onrender.com/api/user/";

export async function getUser(){
    const response = await fetch(BASE_URL + `get/user`, {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("auth-token")}` 
        }
    })
    const result = await response.json();
    if (response.ok) {
        return result;
    } else {
        throw new Error(`Response status: ${response.status}, ${JSON.stringify(result)}`);
    }
}

export async function login(email: string, password: string){
    try {
        const response = await fetch(BASE_URL + `email/${email}/password/${password}`, {
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

export async function signup(user: User){
    try {
        const response = await fetch(BASE_URL + "add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
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