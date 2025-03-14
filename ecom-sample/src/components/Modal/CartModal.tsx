import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import CartItem from "../CartItem/CartItem";
import { useCartContext } from "../../context/CartContext";
import { useModalContext } from "../../context/ModalContext";
import * as orderAPI from "../../api/order-api";
import "./Modal.css";

export default function CartModal(){
    const { cart } = useCartContext();
    const { showCartModal, toggleShowCartModal } = useModalContext();

    const handleClose = () => {
        toggleShowCartModal(false);
    };

    const handleSubmit = async () => {
        try {
            if (cart.id > 0){
                const response = await orderAPI.updateOrder(cart); //Update if existing id
                if (!response.error){
                                
                } else {
                    console.log(response.error);
                }
            } else {
                const response = await orderAPI.addOrder(cart); //Add if no id
                if (!response.error){
                                
                } else {
                    console.log(response.error);
                }
            }
        } catch (error){
            console.log(error);
        }
    }

    const calculateTotalPrice = () => {
        try {
            if (cart.orderItemList){
                let total = 0;
                for (const item of cart.orderItemList){
                    total = total + item.calculateItemPrice();
                }
                return total;
            }
        } catch(error){
            console.log(error);
        }
    }
    
    return (
        <Dialog
            open={showCartModal}
            onClose={handleClose}
            fullWidth 
            maxWidth="md">
            <DialogTitle><Typography variant="h4">Cart Items</Typography></DialogTitle>
            <DialogContent>
                <div className="cartModal">
                    <div>
                        {cart.orderItemList?.map((item) => (<CartItem item={item}/>))}
                    </div>
                    {cart.orderItemList.length === 0 
                    ? 
                    <Typography variant="h5">{`Select items from our Products list!`}</Typography> 
                    : 
                    <Typography variant="h5">{`Total sum: $${calculateTotalPrice()}`}</Typography>}
                    
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Continue Shopping</Button>
                <Button onClick={handleSubmit}>Submit Order!</Button>
            </DialogActions>
        </Dialog>
    );

    //https://stackoverflow.com/questions/47181399/dialog-width-material-ui (change dialog size)
}