import { useState } from 'react';
//mui imports
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, TextField } from "@mui/material";
//api imports
import * as productAPI from "../../api/product-api";
//model imports
import { Product } from '../../models/Product';
//util imports
import "./ProductComponent.css";

type RestockProductItemModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    product: Product;
    reloadProduct: (product: Product) => void;
};

export default function RestockProductItemModal({ showModal, setShowModal, product, reloadProduct }: RestockProductItemModalProps){
    const [newStockQuantity, setNewStockQuantity] = useState<number>(0);
    const [showLoading, setShowLoading] = useState<boolean>(false);

    const checkQuantityInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const newQuantity = parseInt(event.target.value);
            setNewStockQuantity(newQuantity);
        } catch (error) {
            //Display error message
            console.log(error);
        } 
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            const updateStock = async () => {
                setShowLoading(true);
                const newProduct: Product = structuredClone(product);
                newProduct.quantity = newStockQuantity;
                const response = await productAPI.updateProduct(newProduct);
                if (response.error){
                    throw new Error(`Unable to update quantity.`);
                }
            }
            await updateStock();
            setNewStockQuantity(0);
            setShowLoading(false);
            setShowModal(false);
            reloadProduct(product);
        } catch (error) {
            //Display error message
            console.log(error);
        }
    };

    return (
        <Dialog
            open={showModal}
            onClose={() => {setShowModal(false)}}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit
                },
            }}>
            <DialogTitle>{`Updating Stock for ${product.name}`}</DialogTitle>
            <DialogContent>
                <div className='flexContainer'>
                    <TextField label="Current Quantity" name="current" variant="outlined" type="number" value={product.quantity} disabled/>
                    <TextField label="New Quantity" name="new" variant="outlined" type="number" value={newStockQuantity} onChange={checkQuantityInput} required/>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {setShowModal(false)}}>Cancel</Button>
                <Button type="submit">Confirm</Button>
            </DialogActions>
            <Box sx={{ width: '100%', display: showLoading ? "" : "none"}}>
                <LinearProgress/>
            </Box>
        </Dialog>
    );
}