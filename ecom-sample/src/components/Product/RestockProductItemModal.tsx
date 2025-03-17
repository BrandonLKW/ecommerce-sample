import { useState } from 'react';
//mui imports
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, TextField } from "@mui/material";
//api imports
import * as productAPI from "../../api/product-api";
//model imports
import { Product } from '../../models/Product';
//context imports
import { useModalContext } from '../../context/ModalContext';
//util imports
import * as stringHelper from "../../util/stringHelper";
import "./ProductComponent.css";

type RestockProductItemModalProps = {
    showModal: boolean;
    setShowModal: (show: boolean) => void;
    product: Product;
    reloadProduct: (product: Product) => void;
};

export default function RestockProductItemModal({ showModal, setShowModal, product, reloadProduct }: RestockProductItemModalProps){
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const { toggleMessageModal } = useModalContext();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        setShowLoading(true);
        try {
            event.preventDefault();
            const updateStock = async () => {
                //Get form inputs
                const formData = new FormData(event.currentTarget);
                const formJson = Object.fromEntries((formData as any).entries());
                //Check quantity input
                try {
                    const newQuantity = parseInt(formJson.quantity);
                    if (!newQuantity){
                        throw (`Please enter only numbers for Quantity.`);
                    }
                    //Dont allow -ve numbers, and set a temp limit of 10000
                    if (newQuantity < 0 || newQuantity > 10000){
                        throw (`Quantity must be less than 10000 and cannot be negative!`);
                    }
                } catch (error) {
                    //assume parsing error only
                    throw (`Please enter only whole numbers for Quantity.`);
                }
                //Pass product with updated params to api call
                const newProduct: Product = structuredClone(product);
                newProduct.quantity = formJson.quantity;
                const response = await productAPI.updateProduct(newProduct);
                if (response.error){
                    throw new Error(response.error);
                }
            }
            await updateStock();
            setShowModal(false);
            reloadProduct(product);
        } catch (error) {
            toggleMessageModal(true, `Update stock Error: ${error}`, "ERROR")
        }
        setShowLoading(false);
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
            <DialogTitle>{`Updating Stock for ${stringHelper.capitaliseFirstChar(product.name)}`}</DialogTitle>
            <DialogContent>
                <div className='flexContainer'>
                    <TextField label="Current Quantity" name="current" variant="outlined" type="number" value={product.quantity} disabled/>
                    <TextField label="New Quantity" name="quantity" variant="outlined" type="number" required/>
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