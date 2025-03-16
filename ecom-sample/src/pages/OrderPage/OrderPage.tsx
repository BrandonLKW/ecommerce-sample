import { useEffect, useState } from "react";
//mui imports
import { Avatar, Box, Button, IconButton, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Tooltip, Typography } from "@mui/material";
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SummarizeIcon from '@mui/icons-material/Summarize';
//api imports
import * as productAPI from "../../api/product-api";
import * as orderAPI from "../../api/order-api";
//model imports
import { Order, OrderStatus } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
//context imports
import { useCartContext } from "../../context/MainContext";
//util imports
import { capitaliseFirstChar } from "../../util/stringHelper";
import "./OrderPage.css";
import { Product } from "../../models/Product";

export default function OrdersPage(){
    const [currentView, setCurrentView] = useState<string>("");
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus>(OrderStatus.COMPLETED);
    const [orderList, setOrderList] = useState<Order[]>([]); 
    const [selectedOrder, setSelectedOrder] = useState<Order>(new Order({}));
    const [selectedOrderItemList, setSelectedOrderItemList] = useState<OrderItem[]>([]); //Populate when individual order is selected
    const { user, updateCart } = useCartContext();

    useEffect(() => {
        //Default loading
        switch (checkCurrentView()) {
            case "PUBLIC":
                loadOrders(OrderStatus.COMPLETED);
                break;
            case "ADMIN":
                loadOrders(OrderStatus.PENDING);
                break;
            default:
                break;
        }
        setCurrentView(checkCurrentView());
    }, []);

    const checkCurrentView = () => {
        if (user.id > 0 && user.account_type === "PUBLIC"){
            return "PUBLIC";
        } else if (user.id > 0 && user.account_type === "ADMIN"){
            return "ADMIN"
        } else {
            //No logged user means nothing is loaded
            return "";
        }   
    }

    const loadOrders = async (status: OrderStatus) => {
        try {
            switch (currentView) {
                case "PUBLIC":
                    const userResponse = await orderAPI.getOrdersByUser(OrderStatus.COMPLETED);
                    if (!userResponse.error) {
                        const results = []; //get array of Order objects from the query
                        for (const item of userResponse) {
                            results.push(new Order(item));
                        }
                        setOrderList(results);
                    } else {
                        throw new Error(userResponse.error);
                    }
                    break;
                case "ADMIN":
                    const adminResponse = await orderAPI.getOrdersByStatus(status); 
                    if (!adminResponse.error) {
                        const results = []; //get array of Order objects from the query
                        for (const item of adminResponse) {
                            results.push(new Order(item));
                        }
                        setOrderList(results);
                    } else {
                        throw new Error(adminResponse.error);
                    }
                    break;
                default:
                    setOrderList([]);
                    setSelectedOrderItemList([]);
                    break;
            }
        } catch (error) {
            //Display error dialog
            console.log(error);
        }
    };

    //Get all related OrderItem objects referencing Order.id
    const loadOrderItems = async (selectedOrder: Order) => {
        try {
            setSelectedOrder(selectedOrder);
            //Load OrderItem objs based on selectedOrder
            const response = await orderAPI.getOrderItemsByOrderId(selectedOrder.id);
            if (!response.error) {
                const results = []; //get array of OrderItem objects from the query
                for (const item of response) {
                    results.push(new OrderItem(item));
                }
                setSelectedOrderItemList(results);
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            //Display error dialog
            console.log(error);
        }
    }

    const handleOrderIconClick = async (status: OrderStatus) => {
        try {
            setOrderStatusFilter(status);
            loadOrders(status);
            //reset selections
            setSelectedOrder(new Order({}));
            setSelectedOrderItemList([]); 
        } catch (error) {
            //Display error dialog
            console.log(error);
        }
    }
    
    const handleCopyCartClick = async () => {
        try {
            const clonedOrderItemList = [];
            for (const item of selectedOrderItemList){
                //Check if fruit exists, and current quantity/price of fruit
                const response = await productAPI.getProductById(item.product_id);
                if (!response.error){
                    const product = new Product(response[0]);
                    if (product.quantity >= item.quantity){
                        const clonedOrderItem = new OrderItem({
                            product : product,
                            product_id: item.product_id,
                            quantity: item.quantity,
                            unit_price: product.unit_price //set unit price to current instead of past order
                        })
                        clonedOrderItemList.push(clonedOrderItem);
                    } else {
                        throw new Error(`Unable to copy cart, ${product.name} is not available or does not have enough quantity remaining.`); //Throw error as long as any one product is not available
                    }
                } else {
                    throw new Error(`Issue copying cart due to missing Product Information, try again later!`);
                }
            }
            const clonedOrder = new Order({
                status: OrderStatus.PENDING,
                orderItemList: clonedOrderItemList,
            });
            updateCart(clonedOrder);
        } catch (error) {
            //Display error dialog
            console.log(error);
        }
    }

    return (
        <div className="orderspage">
            <div className="orderspageheader">
                <Typography variant="h4">{`${capitaliseFirstChar(orderStatusFilter)} Orders`}</Typography>
                <div className="orderspageheadericons">
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Pending Orders">
                            <IconButton onClick={() => {handleOrderIconClick(OrderStatus.PENDING)}}>
                                <PendingIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Cancelled Orders">
                            <IconButton onClick={() => {handleOrderIconClick(OrderStatus.CANCELLED)}}>
                                <CancelIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Completed Orders">
                            <IconButton onClick={() => {handleOrderIconClick(OrderStatus.COMPLETED)}}>
                                <CheckCircleIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="All Orders">
                            <IconButton onClick={() => {handleOrderIconClick(OrderStatus.All)}}>
                                <SummarizeIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </div>
            </div>
            <div className="orderspagecol1">
                <List className="sidebarlist">
                    {orderList.map((order) => (
                        <div key={order.id}>
                            <ListItemButton 
                                className="sidebaritem"
                                onClick={() => loadOrderItems(order)}>
                                <ListItemText className="sidebarlistitem" primary={`Order #${order.id}`} />
                            </ListItemButton>
                        </div>
                    ))}
                </List>
            </div>
            <div className="orderspagecol2">
                {selectedOrder.id !== 0 
                ? 
                <div>
                    <Typography variant="h3">{`Order #${selectedOrder.id}`}</Typography>
                    <List>
                        {selectedOrderItemList.map((orderItem) => (
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        <img src={orderItem.product.image} height="50px" width="50px"/>
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={`${orderItem.product.name} - Bought ${orderItem.quantity} units at $${orderItem.unit_price} each.`}/>
                            </ListItem>
                        ))}
                    </List>
                    <Button onClick={handleCopyCartClick}>{`Copy these items to Cart!`}</Button>
                </div> 
                : 
                <Typography variant="h2">Select an order!</Typography>
                }
            </div>
        </div>
    )
}