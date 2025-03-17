import { useEffect, useState } from "react";
//mui imports
import { Avatar, Box, Button, IconButton, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Tooltip, Typography } from "@mui/material";
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircularProgress from '@mui/material/CircularProgress';
//api imports
import * as productAPI from "../../api/product-api";
import * as orderAPI from "../../api/order-api";
//model imports
import { Order, OrderStatus } from "../../models/Order";
import { OrderItem } from "../../models/OrderItem";
import { Product } from "../../models/Product";
import { UserAccountType } from "../../models/User";
//context imports
import { useMainContext } from "../../context/MainContext";
import { useModalContext } from "../../context/ModalContext";
//util imports
import { capitaliseFirstChar } from "../../util/stringHelper";
import { getFormattedDate } from "../../util/dateHelper";
import "./OrderPage.css";

export default function OrdersPage(){
    const [showLoading, setShowLoading] = useState<boolean>(false);
    const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus>(OrderStatus.COMPLETED);
    const [orderList, setOrderList] = useState<Order[]>([]); 
    const [selectedOrder, setSelectedOrder] = useState<Order>(new Order({}));
    const [selectedOrderItemList, setSelectedOrderItemList] = useState<OrderItem[]>([]); //Populate when individual order is selected
    const { cart, user, updateCart } = useMainContext();
    const { toggleMessageModal } = useModalContext();

    useEffect(() => {
        //Default loading
        switch (user.account_type) {
            case UserAccountType.PUBLIC:
                loadOrders(OrderStatus.COMPLETED);
                setOrderStatusFilter(OrderStatus.COMPLETED);
                break;
            case UserAccountType.ADMIN:
                loadOrders(OrderStatus.PROCESSING);
                setOrderStatusFilter(OrderStatus.PROCESSING);
                break;
            default:
                break;
        }
    }, []);

    const loadOrders = async (status: OrderStatus) => {
        setShowLoading(true);
        try {
            let response: any; 
            switch (user.account_type) {
                case UserAccountType.PUBLIC:
                    response = await orderAPI.getOrdersByUser(status);
                    break;
                case UserAccountType.ADMIN:
                    response = await orderAPI.getOrdersByStatus(status); 
                    break;
                default:
                    setOrderList([]);
                    setSelectedOrderItemList([]);
                    break;
            }
            if (!response.error) {
                const results = []; //get array of Order objects from the query
                for (const item of response) {
                    results.push(new Order(item));
                }
                setOrderList(results.sort((a,b) => b.id - a.id)); //https://stackoverflow.com/questions/21687907/typescript-sorting-an-array
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            toggleMessageModal(true, `Issue loading Orders, try again later!`, "ERROR");
            console.log(error);
        }
        setShowLoading(false);
    };

    //Get all related OrderItem objects referencing Order.id
    const loadOrderItems = async (selectedOrder: Order) => {
        setShowLoading(true);
        try {
            setSelectedOrder(selectedOrder);
            //Load OrderItem objs based on selectedOrder
            const response = await orderAPI.getOrderItemsByOrderId(selectedOrder.id);
            if (!response.error) {
                const results = []; //get array of OrderItem objects from the query
                for (const item of response) {
                    const itemObj = new OrderItem(item);
                    const productResponse = await productAPI.getProductById(item.product_id);
                    if (!productResponse.error) {
                        itemObj.product = productResponse[0];
                    }
                    results.push(itemObj);
                }
                setSelectedOrderItemList(results.sort((a,b) => b.id - a.id));
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            toggleMessageModal(true, `Issue loading Order Items, try again later!`, "ERROR");
            console.log(error);
        }
        setShowLoading(false);
    }

    const handleOrderIconClick = async (status: OrderStatus) => {
        try {
            setOrderStatusFilter(status);
            loadOrders(status);
            //reset selections
            setSelectedOrder(new Order({}));
            setSelectedOrderItemList([]); 
        } catch (error) {
            console.log(error);
        }
    }

    const handleMarkCompleteClick = async () => {
        selectedOrder.completed_date = getFormattedDate(new Date());
        selectedOrder.status = OrderStatus.COMPLETED;
        const response = await orderAPI.updateOrder(selectedOrder);
        if (!response.error){
            setOrderList(orderList.filter((order) => {return order.id != selectedOrder.id})); //remove completed order from list
            setSelectedOrder(new Order({}));
            toggleMessageModal(true, `Order successfully completed!`, "SUCCESS");
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
                    if (parseInt(product.quantity.toString()) >= parseInt(item.quantity.toString())){ //KIV to find a better solution to type checks
                        const clonedOrderItem = new OrderItem({
                            product : product,
                            product_id: item.product_id,
                            quantity: item.quantity,
                            unit_price: product.unit_price //set unit price to current instead of past order
                        })
                        clonedOrderItemList.push(clonedOrderItem);
                    } else {
                        toggleMessageModal(true, `Unable to copy cart, ${product.name} is not available or does not have enough quantity remaining.`, "ERROR");
                        return;
                    }
                } else {
                    toggleMessageModal(true, `Issue copying cart due to missing Product Information, try again later!`, "ERROR");
                    return;
                }
            }
            const clonedOrder = new Order({
                id: cart.id,
                status: OrderStatus.PENDING,
                orderItemList: clonedOrderItemList,
            });
            updateCart(clonedOrder);
            toggleMessageModal(true, `Order copied to cart successfully!`, "SUCCESS");
        } catch (error) {
            //Display error dialog
            toggleMessageModal(true, `Error copying cart, please try again later!`, "ERROR");
            console.log(error);
        }
    }

    return (
        <div className="orderspage">
            <div className="orderspageheader">
                <Typography variant="h4">{`${capitaliseFirstChar(orderStatusFilter)} Orders`}</Typography>
                <Box sx={{ display: showLoading ? "" : "none" }}>
                    <CircularProgress />
                </Box>
            </div>
            <div className="orderspagecol1">
                <div className="orderspageheadericons">
                    <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Processing Orders">
                            <IconButton onClick={() => {handleOrderIconClick(OrderStatus.PROCESSING)}}>
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
                </div>
                <div className="sidebar">
                    {orderList?.length > 0 
                    ? 
                    <List>
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
                    :
                    <Typography variant="h2">No Orders Found!</Typography>}
                </div>
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
                    {user?.account_type === UserAccountType.ADMIN && orderStatusFilter === OrderStatus.PROCESSING
                    ? 
                    <Button variant="outlined" onClick={handleMarkCompleteClick}>{`Mark Order as complete`}</Button>
                    : 
                    <>
                        {user?.account_type === UserAccountType.PUBLIC 
                        ? 
                        <Button variant="outlined" onClick={handleCopyCartClick}>{`Copy these items to Cart`}</Button> 
                        : <></>}
                    </>
                    }
                </div> 
                : 
                <Typography variant="h2">Select an order!</Typography>
                }
            </div>
        </div>
    )
}