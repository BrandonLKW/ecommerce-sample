import { Divider, Stack, Typography } from "@mui/material";
import { OrderItem } from "../../models/OrderItem";
import "./OrderComponent.css";

type CartItemProps = {
    item: OrderItem;
};

export default function CartItem({ item }: CartItemProps){

    return(
        <Stack className="cartItem"
               direction="row" 
               justifyContent="center"
               alignItems="center"
               divider={<Divider orientation="vertical" flexItem />} 
               spacing={5}>
            <img height="50" width="50" src={item.product.image}/>
            <Typography variant="h6">{item.product.name}</Typography>
            <Typography variant="h6">{item.quantity}</Typography>
            <Typography variant="h6">{`$${item.product.unit_price} each`}</Typography>
            <Typography variant="h6">{`Total Price of: $${item.calculateItemPrice()}`}</Typography>
        </Stack>
    );
}