import { useEffect, useState } from "react";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { Product } from "../../models/Product";
import { useCartContext } from "../../context/CartContext";
import "./ProductItem.css"

type ProductItemProps = {
    product: Product;
};

export default function ProductItem({ product } : ProductItemProps){
    const { updateCartItem } = useCartContext();
    const [inputQuantity, setInputQuantity] = useState<number>(0);

    useEffect(() => {
        //empty for now
    }, []);

    const checkInputQuantity = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const newQuantity = parseInt(event.target.value);
            if (newQuantity < 0){
                setInputQuantity(0); //Do not allow negative numbers
            } else if (newQuantity > product.quantity){
                return; //Do nothing if input quantity is higher than current stock
            } else {
                setInputQuantity(newQuantity);
            }
        } catch(error){
            setInputQuantity(0); //For any errors, default solution is to revert back to 0
        }
    };

    const handleUpdateButton = () => {
        try {
            updateCartItem(product, inputQuantity);
        } catch(error){
            console.log(error);
        }
    }

    return (
        <Stack className="productitem" spacing={1}>
            <img height="200" width="200" src={product.image}/>
            <Typography variant="h6">{product.name}</Typography>
            <Typography variant="h6">{`Unit Price: $${product.unit_price}`}</Typography>
            <Typography variant="h6">{`Available Quantity: ${product.quantity}`}</Typography>
            <TextField label="In Cart" name="cart" variant="outlined" type="number" value={inputQuantity} onChange={checkInputQuantity}/>
            <Button variant="contained" onClick={() => {handleUpdateButton()}}>Update Cart</Button>
        </Stack>
    );
}