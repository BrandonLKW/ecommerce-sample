import { useState } from "react";
//mui imports
import { Alert, Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, LinearProgress, TextField } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
//api imports
import * as userAPI from "../../api/user-api";
//model imports
import { User } from "../../models/User";
//context imports
import { useCartContext } from "../../context/CartContext";
import { useModalContext } from "../../context/ModalContext";
//util imports
import "./Modal.css";


export default function SignUpFormModal(){
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("Error during Sign Up, please check your details and try again.");
    const { updateUser } = useCartContext();
    const { showSignupModal, toggleShowLoginModal, toggleShowSignupModal } = useModalContext(); 
    
    const handlePassTypeClick = () => {
        setShowPassword(!showPassword);
    };

    const handleClose = () => {
        toggleShowSignupModal(false);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowError(false);
        const checkSignup = async () => {
            setShowLoading(true);
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            //Do basic input checks
            if (formJson.password !== formJson.confirm_password){
                setShowError(true);
                setErrorMsg("Password and Confirm Password do not match. Please check and try again.")
                return;
            }
            //Assign to User object and try to create row
            const newUser = new User({
                name_first: formJson.name_first,
                name_last: formJson.name_last,
                email: formJson.email,
                password: formJson.password,
                address_1: formJson.address_1,
                address_2: formJson.address_2
            });
            const response = await userAPI.signup(newUser);
            //If successful, id will be returned in first row
            if (response[0]?.id){
                newUser.id = response.id;
                newUser.password = ""; //clear password since not encrypted and not needed anymore
                updateUser(newUser);
                handleClose();
            } else {
                throw response.message;
            }
        }
        try {
            await checkSignup();
        } catch (error) {
            setShowError(true);
        }
        setShowLoading(false);
    }

    const swapToSignup = () =>{
        toggleShowSignupModal(false);
        toggleShowLoginModal(true);
    };

    return (
        <Dialog
            open={showSignupModal}
            onClose={handleClose} 
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: handleSubmit
                },
            }}
            >
            <DialogTitle>New User</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter your credentials
                </DialogContentText>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    name="name_first"
                    label="First Name"
                    type="text"
                    fullWidth
                    variant="standard"/>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    name="name_last"
                    label="Last Name"
                    type="text"
                    fullWidth
                    variant="standard"/>
                <TextField
                    autoFocus
                    required
                    name="email"
                    margin="dense"
                    label="Email Address"
                    type="email"
                    fullWidth 
                    helperText="Follow format of ABC@Gmail.com"
                    variant="standard"/>
                <TextField
                    autoFocus
                    required
                    name="address_1"
                    margin="dense"
                    label="Address Line 1"
                    type="text"
                    fullWidth
                    variant="standard"/>
                <TextField
                    autoFocus
                    required
                    name="address_2"
                    margin="dense"
                    label="Address Line 2"
                    type="text"
                    fullWidth
                    variant="standard"/>
                <TextField
                    autoFocus
                    required
                    name="password"
                    margin="dense"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    variant="standard"
                    slotProps={
                        showPassword ? 
                        {input: {endAdornment: <VisibilityOffIcon onClick={handlePassTypeClick}/>}} 
                        : {input: {endAdornment: <VisibilityIcon onClick={handlePassTypeClick}/>}}
                    }/>
                <TextField
                    autoFocus
                    required
                    name="confirm_password"
                    margin="dense"
                    label="Confirm Password"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    variant="standard" 
                    slotProps={
                        showPassword ? 
                        {input: {endAdornment: <VisibilityOffIcon onClick={handlePassTypeClick}/>}} 
                        : {input: {endAdornment: <VisibilityIcon onClick={handlePassTypeClick}/>}}
                    }/>
                <Button onClick={swapToSignup}>Already have an existing account? Login here!</Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Sign Up</Button>
            </DialogActions>
            <Alert variant="outlined" severity="error" sx={{display: showError ? "" : "none"}}>
                {errorMsg}
            </Alert>
            <Box sx={{ width: '100%', display: showLoading ? "" : "none"}}>
                <LinearProgress/>
            </Box>
        </Dialog>
    );
}