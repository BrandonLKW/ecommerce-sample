import { createContext, useContext, useState } from "react";
//api imports
import * as orderAPI from "../api/order-api";
import * as productAPI from "../api/product-api";
//models import
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order, OrderStatus } from "../models/Order";
import { OrderItem } from "../models/OrderItem";

export interface MainContextType {
    user: User;
    updateUser: (user: User) => void;
    clearUser: () => void;
    cart: Order;
    updateCart: (order: Order) => void;
    updateCartItem: (product: Product, quantity: number) => void;
    loadCart: () => void;
    clearCartItems: () => void;
}

//Context to handle global events related to the Cart logic
const MainContext = createContext<MainContextType>({} as MainContextType);

export const MainContextProvider = ({ children } : any) => {
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
                    const response = await orderAPI.updateOrder(updatedCart);
                    if (!response.error){
                        updatedCart.id = response[0].id;
                    } else {
                        throw new Error(`Error adding Cart during updateCartItem`);
                    }
                } else {
                    const response = await orderAPI.addOrder(updatedCart);
                    if (response.error){
                        throw new Error(`Error updating Cart during updateCartItem`);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            //Store in localstorage for non-users, users should have carts saved to db right away
            localStorage.setItem("temp-cart", JSON.stringify(updatedCart));
        }
        setCart(updatedCart);
    }

    const loadCart = async () => {
        if (!user){
            return;
        }
        //For un-logged users, load cart from localstorage if any
        if (user.id == 0){
            const storedCartStr = localStorage.getItem("temp-cart");
            if (storedCartStr){
                const storedCart = JSON.parse(storedCartStr); //parse JSON string to object
                //Rebuild order object with children
                const newCart = new Order(storedCart); 
                const newCartItemList = [];
                for (const item of storedCart.orderItemList){
                    newCartItemList.push(new OrderItem(item));
                }
                newCart.orderItemList = newCartItemList;
                updateCart(newCart);
            }
            return;
        }
        //Get pending order of user if any, and cross check with current cart if any
        const response = await orderAPI.getOrdersByUser(OrderStatus.PENDING);
        if (!response.error){
            if (response[0]){
                const order = new Order(response[0]);
                const orderItemResponse = await orderAPI.getOrderItemsByOrderId(order.id);
                if (!orderItemResponse.error){
                    const incomingOrderItemList = [];
                    for (const item of orderItemResponse){
                        const incomingItem = new OrderItem(item); //https://stackoverflow.com/questions/39906054/typescript-object-assign-confusion
                        //If existing cart before login has items, merge their quantity
                        if (cart.orderItemList.length > 0){
                            for (const currentItem of cart.orderItemList){
                                if (currentItem.product_id == parseInt(item.product_id)){
                                    incomingItem.quantity = parseInt(item.quantity) + currentItem.quantity;
                                }
                            }
                        }
                        //Load product object for items pulled from db
                        const productReponse = await productAPI.getProductById(incomingItem.product_id);
                        if (!response.error){
                            incomingItem.product = new Product(productReponse[0]);
                        } else {
                            throw new Error("Error loading products of prior Cart.");
                        }
                        incomingOrderItemList.push(incomingItem);
                    }
                    //https://stackoverflow.com/questions/54134156/javascript-merge-two-arrays-of-objects-only-if-not-duplicate-based-on-specifi
                    const currentProductIdList = new Set(cart.orderItemList.map(item => item.product_id));
                    const mergedList = [...incomingOrderItemList, ...cart.orderItemList.filter(item => !currentProductIdList.has(item.product_id))];
                    order.orderItemList = mergedList;
                    updateCart(order);
                } else {
                    throw new Error(response.error);
                }
            } else{
            //If no pending order, then current cart remains
            }
        } else {
            throw new Error(response.error)
        }
    }

    const clearCartItems = () => {
        setCart(new Order({})); 
    }

    return (
        <MainContext.Provider value={{ user, updateUser, clearUser, cart, updateCart, updateCartItem, loadCart, clearCartItems }}>
            {children}
        </MainContext.Provider>
    );
};

export const useMainContext = () => {
    return useContext(MainContext);
};

//Reference
//https://stackoverflow.com/questions/79026731/how-to-utilise-usecontext-within-a-seperate-function-reactjs
//https://stackoverflow.com/questions/77217290/best-way-to-use-react-context-with-usestate-in-typescript