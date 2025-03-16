import { createContext, useContext, useState } from "react";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import * as orderAPI from "../api/order-api";

export interface CartContextType {
    user: User;
    updateUser: (user: User) => void;
    clearUser: () => void;
    cart: Order;
    updateCart: (order: Order) => void;
    updateCartItem: (product: Product, quantity: number) => void;
    clearCartItems: () => void;
}

//Context to handle global events related to the Cart logic
const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartContextProvider = ({ children } : any) => {
    const [user, setUser] = useState<User>(new User({}));
    const [cart, setCart] = useState<Order>(new Order({}));

    const updateUser = (user: User) => {
        setUser(user);
    }

    const clearUser = () => {
        setUser(new User({}));
    }

    const updateCart = (order: Order) => {
        setCart(order);
    }

    //Method to add/update quantity of one singular Product 
    const updateCartItem = async (product: Product, quantity: number) => {
        const updatedItemList = cart.orderItemList;
        const existingItemIndex = cart.orderItemList.findIndex((item) => item.product_id === product.id);
        if (existingItemIndex > -1){ //findIndex returns -1 if none found
            updatedItemList[existingItemIndex].quantity = quantity; //update quantity if found
        } else {
        const newOrderItem = new OrderItem({
            product_id : product.id,
            unit_price : product.unit_price,
            quantity : quantity,
            product: product
        });
        updatedItemList.push(newOrderItem);
        }
        const updatedCart = new Order({...cart, orderItemList: updatedItemList});
        //If there is a logged user, try and save the cart to db
        if (user.id > 0){
            try {
                if (updatedCart.id > 0){
                    const response = await orderAPI.addOrder(updatedCart);
                    if (!response.error){
                        updatedCart.id = response[0].id;
                    } else {
                        throw new Error(`Error adding Cart during updateCartItem`);
                    }
                } else {
                    const response = await orderAPI.updateOrder(updatedCart);
                    if (response.error){
                        throw new Error(`Error updating Cart during updateCartItem`);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
        setCart(updatedCart);
    }

    const clearCartItems = () => {
        setCart(new Order({})); 
    }

    return (
        <CartContext.Provider value={{ user, updateUser, clearUser, cart, updateCart, updateCartItem, clearCartItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCartContext = () => {
    return useContext(CartContext);
};

//Reference
//https://stackoverflow.com/questions/79026731/how-to-utilise-usecontext-within-a-seperate-function-reactjs
//https://stackoverflow.com/questions/77217290/best-way-to-use-react-context-with-usestate-in-typescript