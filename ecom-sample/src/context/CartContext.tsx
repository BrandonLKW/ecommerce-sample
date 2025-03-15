import { createContext, useContext, useState } from "react";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";

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
  const updateCartItem = (product: Product, quantity: number) => {
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
    setCart(new Order({...cart, orderItemList: updatedItemList}));
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