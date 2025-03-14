import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Box, Button, Toolbar, Tooltip, IconButton, Typography, Menu, MenuItem, Container } from "@mui/material"
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CartModal from '../../components/Modal/CartModal';
import { useModalContext } from "../../context/ModalContext";

const pages = ['Home', 'Products', 'Orders', "Metrics"]; 

export default function Navbar(){
    const { toggleShowCartModal } = useModalContext(); 
    const navigate = useNavigate();

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
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="View Cart">
                            <IconButton onClick={() => {toggleShowCartModal(true)}}>
                                <ShoppingCartIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </Container>
            <CartModal  />
        </AppBar>
    );
}