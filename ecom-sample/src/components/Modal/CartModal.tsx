import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import CartItem from "../CartItem/CartItem";
import { useCartContext } from "../../context/CartContext";
import { useModalContext } from "../../context/ModalContext";
import "./Modal.css";

export default function CartModal(){
    const { cart } = useCartContext();
    const { showCartModal, toggleShowCartModal } = useModalContext();

    const handleClose = () => {
        toggleShowCartModal(false);
    };

    const calculateTotalPrice = () => {
        try {
            let total = 0;
            for (const item of cart){
                total = total + item.calculateItemPrice();
            }
            return total;
        } catch(error){
            console.log(error);
        }
    }
    
    return (
        <>
            <Dialog
                open={showCartModal}
                onClose={handleClose}
                fullWidth 
                maxWidth="md">
                <DialogTitle><Typography variant="h4">Cart Items</Typography></DialogTitle>
                <DialogContent>
                    <div className="cartModal">
                        <div>
                            {cart?.map((item) => (<CartItem item={item}/>))}
                        </div>
                        {cart.length === 0 
                        ? 
                        <Typography variant="h5">{`Select items from our Products list!`}</Typography> 
                        : 
                        <Typography variant="h5">{`Total sum: $${calculateTotalPrice()}`}</Typography>}
                        
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Continue Shopping</Button>
                </DialogActions>
            </Dialog>
        </>
    );

    //https://stackoverflow.com/questions/47181399/dialog-width-material-ui (change dialog size)
}