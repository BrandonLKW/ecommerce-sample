//mui imports
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
//api imports
import * as orderAPI from "../../api/order-api";
//custom component imports
import CartItem from "../CartItem/CartItem";
//model imports
import { OrderStatus } from "../../models/Order";
//context imports
import { useCartContext } from "../../context/CartContext";
import { useModalContext } from "../../context/ModalContext";
//util imports
import * as dateHelper from "../../util/dateHelper";
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
                cart.created_date = dateHelper.getFormattedDate(new Date());
                cart.status = OrderStatus.PROCESSING;
                const response = await orderAPI.addOrder(cart); //Add if no id
                if (!response.error){
                    //Show success message
                    handleClose();
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