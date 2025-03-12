import React, { createContext, useContext, useState } from "react";
import { Product } from "../models/Product";
import { OrderItem } from "../models/OrderItem";

export interface CartContextType {
  cart: OrderItem[];
  setCart: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  updateCartItem: (product: Product, quantity: number) => void;
}

//Context to handle global events related to the Cart logic
const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartContextProvider = ({ children } : any) => {
  const [cart, setCart] = useState<OrderItem[]>([]);

  //Method to add/update quantity of one singular Product 
  const updateCartItem = async (product: Product, quantity: number) => {
    const updatedCart = cart;
    const existingItemIndex = cart.findIndex((item) => item.product_id === product.id);
    if (existingItemIndex > -1){ //findIndex returns -1 if none found
      updatedCart[existingItemIndex].quantity = quantity; //update quantity if found
    } else {
      const newOrderItem = new OrderItem({
        product_id : product.id,
        unit_price : product.unit_price,
        quantity : quantity,
        product: product
      });
      updatedCart.push(newOrderItem);
    }
    setCart(updatedCart);
  }

  return (
    <CartContext.Provider value={{ cart, setCart, updateCartItem }}>
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