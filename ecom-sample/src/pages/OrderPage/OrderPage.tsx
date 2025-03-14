import { useEffect, useState } from "react";
//mui imports
import { Avatar, Box, IconButton, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Tooltip, Typography } from "@mui/material";
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SummarizeIcon from '@mui/icons-material/Summarize';
//api imports
import * as orderAPI from "../../api/order-api";
//model imports
import { Order, OrderStatus } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
//util imports
import { capitaliseFirstChar } from "../../util/stringHelper";
import "./OrderPage.css";

export default function OrdersPage(){
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus>(OrderStatus.Pending);
    const [orderList, setOrderList] = useState<Order[]>([]); 
    const [selectedOrder, setSelectedOrder] = useState<Order>(new Order({}));
    const [selectedOrderItemList, setSelectedOrderItemList] = useState<OrderItem[]>([]); //Populate when individual order is selected

    useEffect(() => {
        loadOrders(orderStatusFilter);
    }, []);

    const loadOrders = async (status: string) => {
        try {
            const response = await orderAPI.getOrdersByStatus(status); 
            if (!response.error) {
                const results = []; //get array of Order objects from the query
                for (const item of response) {
                    results.push(new Order(item));
                }
                setOrderList(results);
            } else {
                throw new Error(response.error);
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

    return (
        <div className="orderspage">
            <div className="orderspageheader">
                <Typography variant="h4">{`${capitaliseFirstChar(orderStatusFilter)} Orders`}</Typography>
                <div className="orderspageheadericons">
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Pending Orders">
                            <IconButton onClick={() => {handleOrderIconClick(OrderStatus.Pending)}}>
                                <PendingIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Cancelled Orders">
                            <IconButton onClick={() => {handleOrderIconClick(OrderStatus.Cancelled)}}>
                                <CancelIcon/>
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Completed Orders">
                            <IconButton onClick={() => {handleOrderIconClick(OrderStatus.Completed)}}>
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
                        <div>
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
                </div> 
                : 
                <Typography variant="h2">Select an order!</Typography>
                }
            </div>
        </div>
    )
}