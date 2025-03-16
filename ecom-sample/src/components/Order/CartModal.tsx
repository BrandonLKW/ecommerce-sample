//mui imports
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
//api imports
import * as orderAPI from "../../api/order-api";
//custom component imports
import CartItem from "./CartItem";
//model imports
import { OrderStatus } from "../../models/Order";
//context imports
import { useMainContext } from "../../context/MainContext";
import { useModalContext } from "../../context/ModalContext";
//util imports
import * as dateHelper from "../../util/dateHelper";
import "./OrderComponent.css";

export default function CartModal(){
    const { cart, user } = useMainContext();
    const { showCartModal, toggleShowCartModal, toggleMessageModal } = useModalContext();

    const handleClose = () => {
        toggleShowCartModal(false);
    };

    const handleSubmit = async () => {
        try {
            if (user.id <= 0){
                toggleMessageModal(true, `Please Login to submit orders!`, "ERROR");
                return;
            }
            cart.status = OrderStatus.PROCESSING;
            if (cart.id > 0){
                const response = await orderAPI.updateOrder(cart); //Update if existing id
                if (!response.error){
                    toggleMessageModal(true, `Order has been submitted and is currently processing!`, "SUCCESS");
                    handleClose();
                } else {
                    throw new Error(response.error);
                }
            } else {
                cart.created_date = dateHelper.getFormattedDate(new Date());
                cart.status = OrderStatus.PROCESSING;
                const response = await orderAPI.addOrder(cart); //Add if no id
                if (!response.error){
                    toggleMessageModal(true, `Order has been submitted and is currently processing!`, "SUCCESS");
                    handleClose();
                } else {
                    throw new Error(response.error);
                }
            }
        } catch (error){
            toggleMessageModal(true, `Unable to process Order now, try again later!`, "ERROR");
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
            <DialogTitle>
                <Typography>Shopping Cart</Typography>
            </DialogTitle>
            <DialogContent>
                <div className="cartModal">
                    <div>
                        {cart.orderItemList?.map((item) => (<CartItem key={item.id} item={item}/>))}
                    </div>
                    {cart.orderItemList.length === 0 
                    ? 
                    <Typography variant="h5">{`Select items from our Products list!`}</Typography> 
                    : 
                    <Typography variant="h5">{`Total cost of cart: $${calculateTotalPrice()}`}</Typography>}
                    
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Continue Shopping</Button>
                {cart?.orderItemList?.length > 0 ? 
                    <Button onClick={handleSubmit}>Submit Order!</Button>
                : <></>}
            </DialogActions>
        </Dialog>
    );

    //https://stackoverflow.com/questions/47181399/dialog-width-material-ui (change dialog size)
}