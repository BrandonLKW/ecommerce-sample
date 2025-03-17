import { createContext, useContext, useState } from "react";
//api imports
import * as orderAPI from "../api/order-api";
import * as productAPI from "../api/product-api";
//models import
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order, OrderStatus } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
//util import
import * as dateHelper from "../util/dateHelper";

export interface MainContextType {
    user: User;
    updateUser: (user: User) => void;
    clearUser: () => void;
    cart: Order;
    updateCart: (order: Order) => void;
    updateCartItem: (product: Product, quantity: number) => void;
    mergeCart: () => void;
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
        const existingItemIndex = cart.orderItemList.findIndex((item) => item.product_id == product.id);
        if (existingItemIndex > -1){ //findIndex returns -1 if none found
            updatedItemList[existingItemIndex].quantity = quantity; //update quantity if found
        } else {
            const newOrderItem = new OrderItem({
                order_id: cart.id,
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
                    updatedCart.created_date = dateHelper.getFormattedDate(new Date());
                    const response = await orderAPI.addOrder(updatedCart);
                    if (response.error){
                        throw new Error(`Error updating Cart during updateCartItem: ${response.error}`);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            //Store in localstorage for non-users, users should have carts saved to db right away
            localStorage.setItem("temp-cart", JSON.stringify(updatedCart));
        }
        const reloadedCart = await loadCart();
        setCart(reloadedCart);
    }

    const loadCart = async () => {
        if (!user){
            return new Order({});
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
                return newCart;
            } else {
                return new Order({});
            }
        }
        //Get pending order of user if any, and cross check with current cart if any
        const response = await orderAPI.getOrdersByUser(OrderStatus.PENDING);
        if (!response.error) {
            if (response[0]) {
                const order = new Order(response[0]);
                const orderItemResponse = await orderAPI.getOrderItemsByOrderId(order.id);
                if (!orderItemResponse.error) {
                    const orderItemList = [];
                    for (const item of orderItemResponse){
                        const itemObj = new OrderItem(item); //https://stackoverflow.com/questions/39906054/typescript-object-assign-confusion
                        //Load product object for items pulled from db
                        const productReponse = await productAPI.getProductById(itemObj.product_id);
                        if (!response.error){
                            itemObj.product = new Product(productReponse[0]);
                        } else {
                            throw new Error("Error loading products of Order.");
                        }
                        orderItemList.push(itemObj);
                    }
                    order.orderItemList = orderItemList;
                    return order;
                } else {
                    throw new Error(response.error);
                }
            } else{
                return new Order({});
            }
        } else {
            return new Order({});
        }
    }

    //Method to merge current order in browser with order in database
    const mergeCart = async () => {
        try {
            //Check if logged user has any pending carts to merge
            const loadedCart: Order = await loadCart();
            if (loadedCart.id > 0){
                //If existing cart before login has items, merge their quantity
                const incomingOrderItemList: OrderItem[] = [];
                for (const loadedItem of loadedCart.orderItemList){
                    const incomingItem = new OrderItem(loadedItem);
                    if (cart.orderItemList.length > 0){
                        for (const currentItem of cart.orderItemList){
                            if (loadedItem.product_id == currentItem.product_id){
                                incomingItem.quantity = parseInt(loadedItem.quantity.toString()) + parseInt(currentItem.quantity.toString()); //temp fix, to find a better solution for typing
                            }
                        }
                    }
                    incomingOrderItemList.push(incomingItem);
                }
                //https://stackoverflow.com/questions/54134156/javascript-merge-two-arrays-of-objects-only-if-not-duplicate-based-on-specifi
                const currentProductIdList = new Set(cart.orderItemList.map(item => item.product_id));
                const mergedList = [...incomingOrderItemList, ...cart.orderItemList.filter(item => !currentProductIdList.has(item.product_id))];
                loadedCart.orderItemList = mergedList;
                updateCart(loadedCart);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const clearCartItems = () => {
        setCart(new Order({})); 
    }

    return (
        <MainContext.Provider value={{ user, updateUser, clearUser, cart, updateCart, updateCartItem, mergeCart, clearCartItems }}>
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