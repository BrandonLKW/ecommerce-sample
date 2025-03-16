import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Toolbar, Tooltip, IconButton, Typography, Menu, MenuItem, Container } from "@mui/material"
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CartModal from '../Order/CartModal';
import { useMainContext } from "../../context/MainContext";
import { useModalContext } from "../../context/ModalContext";

const pages = ["Home", "Products"]; 
const publicUserPages = ["Orders"];
const adminPages = ["Orders", "Metrics"];

export default function Navbar(){
    const settings = ['Logout'];
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const { user, clearUser, clearCartItems } = useMainContext();
    const { toggleShowLoginModal, toggleShowCartModal } = useModalContext(); 
    const navigate = useNavigate();

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(null);
        switch (event.currentTarget.outerText.toUpperCase()){
            case "LOGOUT":
                clearUser();
                clearCartItems();
                localStorage.removeItem("auth-token");
                navigatePage("HOME");
                break;
            default:
                break;
        }
    };

    const handleCloseNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        navigatePage(event.currentTarget.outerText);
    };

    const navigatePage = (page: string) => {
        switch (page.toUpperCase()){
            case "HOME":
                navigate("/");
                break;
            case "PRODUCTS":
                navigate("/products");
                break;
            case "ORDERS":
                navigate("/orders");
                break;
            case "METRICS":
            navigate("/metrics");
            break;
            default:
                //Do nothing if no link
                break;
        }
    }

    return (
        <AppBar>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: 'white', display: 'block' }}>
                                {page}
                            </Button>
                        ))}
                        {user.id > 0 && user.account_type === "PUBLIC" ? 
                        publicUserPages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: 'white', display: 'block' }}>
                                {page}
                            </Button>
                        ))
                        : <></>}
                        {user.id > 0 && user.account_type === "ADMIN" ? 
                        adminPages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: 'white', display: 'block' }}>
                                {page}
                            </Button>
                        ))
                        : <></>}
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="View Cart">
                            <IconButton onClick={() => {toggleShowCartModal(true)}}>
                                <ShoppingCartIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            {user.id === 0 ? 
                            <Button onClick={() => toggleShowLoginModal(true)} sx={{ my: 2, color: 'white', display: 'block' }}>
                                Login here!
                            </Button> 
                            : 
                            <Button onClick={handleOpenUserMenu} sx={{ my: 2, color: 'white', display: 'block' }}>
                                {`${user.name_first}`} 
                            </Button>}
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}>
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
            <CartModal  />
        </AppBar>
    );
}