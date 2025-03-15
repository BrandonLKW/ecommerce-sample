import { useState } from "react";
//mui imports
import { Button, Stack, TextField, Typography } from "@mui/material";
//model imports
import { Product } from "../../models/Product";
//custom component imports
import RestockProductItemModal from "./RestockProductItemModal";
//context imports
import { useCartContext } from "../../context/CartContext";
//util imports
import * as stringHelper from "../../util/stringHelper";
import "./ProductComponent.css"

type ProductItemProps = {
    product: Product;
    reloadProduct: (product: Product) => void;
};

export default function ProductItem({ product, reloadProduct } : ProductItemProps){
    const [showRestockModal, setShowRestockModal] = useState<boolean>(false);
    const [inputQuantity, setInputQuantity] = useState<number>(0);
    const { user, updateCartItem } = useCartContext();

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

    const handleRestockButton = () => {
        setShowRestockModal(true);
    }

    const handleAddButton = () => {
        try {
            updateCartItem(product, inputQuantity);
        } catch(error){
            console.log(error);
        }
    }

    return (
        <Stack className="productitem" spacing={1}>
            <img height="200" width="200" src={product.image}/>
            <Typography variant="h6">{stringHelper.capitaliseFirstChar(product.name)}</Typography>
            <Typography variant="h6">{`Unit Price: $${product.unit_price}`}</Typography>
            <Typography variant="h6">{`Available Quantity: ${product.quantity}`}</Typography>
            {user.account_type !== "ADMIN" ? 
            <TextField label="In Cart" name="cart" variant="outlined" type="number" value={inputQuantity} onChange={checkInputQuantity}/>
            : <></>}
            {user.account_type === "ADMIN" ? 
            <Button variant="contained" onClick={() => {handleRestockButton()}}>Restock</Button>
            : 
            <Button variant="contained" onClick={() => {handleAddButton()}}>Add to Cart</Button>}
            <RestockProductItemModal showModal={showRestockModal} setShowModal={setShowRestockModal} product={product} reloadProduct={reloadProduct}/>
        </Stack>
    );
}