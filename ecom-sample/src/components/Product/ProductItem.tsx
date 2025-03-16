import { useEffect, useState } from "react";
//mui imports
import { Button, Stack, TextField, Typography } from "@mui/material";
//api imports
import * as metricAPI from "../../api/metric-api";
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
    const [pendingUserCount, setPendingUserCount] = useState<number>(0);
    const { user, cart, updateCartItem } = useCartContext();

    useEffect(() => {
        try {
            const loadPendingUsers = async () => {
                //Load number of users who have saved this product in cart
                const response = await metricAPI.getPendingUserCountByProduct(product.id);
                if (!response.error){
                    setPendingUserCount(response[0].count);
                } else {
                    //Assume this is a QOL feature, so if api call fails just default to 0
                    setPendingUserCount(0);
                }
            };
            loadPendingUsers();
        } catch (error) {
            console.log(error);
        }
    }, []);

    //update quantity when cart is updated
    useEffect(() => {
        try {
            const updatedOrderItem = cart.orderItemList.find((item) => item.product_id == product.id);
            if (updatedOrderItem){
                setInputQuantity(updatedOrderItem.quantity);
            }
        } catch (error) {
            console.log(error);
        }
    }, [cart])

    const checkInputQuantity = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setInputQuantity(parseInt(event.target.value));
        } catch (error) {
            setInputQuantity(0);
        }
    }

    const handleRestockButton = () => {
        setShowRestockModal(true);
    }

    const handleAddButton = () => {
        try {
            //Check input quantity on add rather than on event change
            if (inputQuantity <= 0) { //Do not allow negative numbers
                throw new Error(`Quantity for ${product.name} needs to be more than 0!`);
            } 
            if (inputQuantity > product.quantity){
                throw new Error(`Quantity for ${product.name} is more than available!`)
            }
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
            {pendingUserCount > 0 ? 
            <Typography>{`In the cart of ${pendingUserCount} user(s)!`}</Typography>
            : <Typography></Typography>
            }
            {user.account_type !== "ADMIN" ? 
            <TextField label="In Cart" name="cart" variant="outlined" type="number" value={inputQuantity} onChange={checkInputQuantity}/>
            : <></>}
            {user.account_type === "ADMIN" ? 
            <Button variant="contained" onClick={() => {handleRestockButton()}}>Restock</Button>
            : 
            <Button variant="contained" onClick={() => {handleAddButton()}}>{`Update Cart`}</Button>}
            <RestockProductItemModal showModal={showRestockModal} setShowModal={setShowRestockModal} product={product} reloadProduct={reloadProduct}/>
        </Stack>
    );
}