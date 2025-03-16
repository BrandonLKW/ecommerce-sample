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
import { useMainContext } from "../../context/MainContext";
import { useModalContext } from "../../context/ModalContext";
//util imports
import "./UserComponent.css";

export default function LoginFormModal(){
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [showError, setShowError] = useState<boolean>(false);
    const { updateUser } = useMainContext();
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