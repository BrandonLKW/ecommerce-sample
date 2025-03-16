import { useState } from "react";
//mui imports
import { Alert, Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, LinearProgress, TextField } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
//api imports
import * as userAPI from "../../api/user-api";
import * as orderAPI from "../../api/order-api";
import * as productAPI from "../../api/product-api";
//model imports
import { User } from "../../models/User";
import { Order, OrderStatus } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
import { Product } from "../../models/Product";
//context imports
import { useCartContext } from "../../context/CartContext";
import { useModalContext } from "../../context/ModalContext";
//util imports
import "./Modal.css";

export default function LoginFormModal(){
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const { cart, updateCart, updateUser } = useCartContext();
    const { showLoginModal, toggleShowLoginModal, toggleShowSignupModal } = useModalContext(); 

    //To handle visibility of password
    const handlePassTypeClick = () => {
        setShowPassword(!showPassword);
    };

    const handleClose = () => {
        toggleShowLoginModal(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowError(false);
        const checkLogin = async () => {
            setShowLoading(true);
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            const response = await userAPI.login(formJson.email, formJson.password);
            if (response.id){
                localStorage.setItem("auth-token", response.token);
                updateUser(new User(response));
            } else {
                throw new Error("Error logging in, please check credentials and try again!");
            }
        }
        try {
            await checkLogin();
            const response = await orderAPI.getOrdersByUser(OrderStatus.PENDING);
            if (!response.error){
                //Get pending order of user if any, and cross check with current cart if any
                if (response[0]){
                    const order = new Order(response[0]);
                    const orderItemResponse = await orderAPI.getOrderItemsByOrderId(order.id);
                    if (!orderItemResponse.error){
                        const incomingOrderItemList: OrderItem[] = [];
                        for (const item of orderItemResponse){
                            const incomingItem = new OrderItem(item);
                            //If existing cart before login has items, merge their quantity
                            console.log("existing cart", cart.orderItemList);
                            if (cart.orderItemList.length > 0){
                                for (const currentItem of cart.orderItemList){
                                    if (currentItem.product_id === parseInt(item.product_id)){
                                        incomingItem.quantity = parseInt(item.quantity) + currentItem.quantity;
                                        console.log("new quant", incomingItem.quantity);
                                    }
                                }
                            }
                            //Load product object for items pulled from db
                            const productReponse = await productAPI.getProductById(incomingItem.product_id);
                            if (!response.error){
                                incomingItem.product = new Product(productReponse[0]);
                            } else {
                                throw new Error("Error loading products of prior Cart.");
                            }
                            incomingOrderItemList.push(incomingItem);
                        }
                        //https://stackoverflow.com/questions/54134156/javascript-merge-two-arrays-of-objects-only-if-not-duplicate-based-on-specifi
                        const currentProductIdList = new Set(cart.orderItemList.map(item => item.product_id));
                        const mergedList = [...incomingOrderItemList, ...cart.orderItemList.filter(item => !currentProductIdList.has(item.product_id))];
                        order.orderItemList = mergedList;
                        updateCart(order);
                    } else {
                        throw new Error(response.error);
                    }
                } else{
                    //If no pending order, then current cart remains
                }
            } else {
                throw new Error(response.error)
            }
            handleClose();
        } catch (error) {
            setShowError(true);
            console.log(error);
        }
        setShowLoading(false);
    };

    const swapToSignup = () =>{
        toggleShowLoginModal(false);
        toggleShowSignupModal(true);
    };

    return (
        <Dialog
            open={showLoginModal}
            onClose={handleClose} 
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit
                },
            }}>
            <DialogTitle>Existing User</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter your credentials
                </DialogContentText>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    name="email"
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="standard"/>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    variant="standard"
                    slotProps={
                        showPassword ? 
                        {input: {endAdornment: <VisibilityOffIcon onClick={handlePassTypeClick}/>}} 
                        : {input: {endAdornment: <VisibilityIcon onClick={handlePassTypeClick}/>}}
                    }/>
                <Button onClick={swapToSignup}>No account? Sign Up here!</Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Log In</Button>
            </DialogActions>
            <Alert variant="outlined" severity="error" sx={{display: showError ? "" : "none"}}>
                Error during Login, please check your details and try again.
            </Alert>
            <Box sx={{ width: '100%', display: showLoading ? "" : "none"}}>
                <LinearProgress/>
            </Box>
        </Dialog>
    );
}